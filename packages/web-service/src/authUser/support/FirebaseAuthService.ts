import { onIdTokenChanged, Unsubscribe, User } from 'firebase/auth';
import { BehaviorSubject, ReplaySubject, Unsubscribable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { userRolesFromCustomClaims, UserIdentifier, UserRoles } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../../logging';
import { auth } from '../../util/firebase';
import { AbstractService } from '../../util/AbstractService';
import { AuthedUserState, LoggedOut } from '../type';
import { clearAuthSessionCookie, setAuthSessionCookie } from './sessionCookie';
import { AuthedUserService } from './AuthedUserService';

const log = getLogger(ServiceLogger.AUTH_USER);

// a delegate for AuthUserService that encapsulates all of the Firebase Auth
// complexity and concerns
// ********************************************************************************
export class FirebaseAuthService extends AbstractService {
  // these span login / logout cycles
  private readonly customClaims$ = new BehaviorSubject<UserRoles>({/*initially empty*/});
  private readonly authedUserState$ = new ReplaySubject<AuthedUserState>(1/*only last value*/);

  // ..............................................................................
  // all these have the same life-span (which is per-User). These members exist
  //  purely for simplicity when checking if the state maintained by AuthedUserService
  // has changed when an update occurs
  private firebaseUser: User | null | undefined = undefined/*initially 'never had one'*/;
  private userId: UserIdentifier | null | undefined = undefined/*matches firebaseUser and is purely for convenience*/;
  public getUserId() { return this.userId; }

  private currentAuthedUserState: AuthedUserState = LoggedOut/*initially logged out*/;
  public getCurrentAuthedUserState() { return this.currentAuthedUserState; }

  // TODO: listen for Profile changes and if the roles differ from the Custom Claims
  //       then do a token refresh. The roles always lead the Claims. The only hitch
  //       is due to the on-write trigger which may delay the Claims being updated.
  private authedUserService: AuthedUserService | undefined = undefined/*none until there is an Auth'd User*/;
  private authedUserStateUnsubscribable: Unsubscribable | undefined = undefined/*parallels 'authedUserService'*/;

  // ..............................................................................
  // due to the fact that multiple callbacks to onIdTokenChanged() can be running
  // at the same time, a FIFO is used to store the arguments to the callback and
  // then they are all called in order
  // SEE: #subscribeFirebaseAuth()
  private idTokenChangedQueue: Array<User | null> = []/*default none*/;

  private firebaseAuthUnsubscribe: Unsubscribe | undefined = undefined/*initially until #subscribeFirebaseAuth() or after shutdown*/;

  // ..............................................................................
  // it is possible that a create-shutdown occurs so quickly (i.e. within the same
  // tick) that the unsubscribe hook doesn't even exist yet. This flag ensures that
  // if the subscription is later created then it will be immediately unsubscribed
  private isShutDown = false/*initializing (not shutting down) by default*/;

  // == Life-Cycle ================================================================
  // SEE #shutdown()
  public constructor() {
    super();
    this.subscribeFirebaseAuth();
  }

  public async shutdown() {
    this.isShutDown = true/*indicate shutdown in progress*/;

    if(!this.firebaseAuthUnsubscribe) { log.warn(`${this.logContext()} Attempting to shut down but there is no Firebase Auth subscription.`); return/*already flagged so it will auto-cleanup*/; }

    // detach from Firestore first to ensure that states cannot be updated while
    // shut down is in progress
    this.firebaseAuthUnsubscribe();
    this.firebaseAuthUnsubscribe = undefined/*by contract*/;

    // remove any dependents
    this.idTokenChangedQueue = []/*clear*/;
    await this.clearUserState();
  }

  // == User State ================================================================
  private async createUserState(firebaseUser: User) {
    if(this.authedUserService !== undefined) {
      log.error(`${this.logContext()} Existing AuthedUser state (${this.authedUserService.getAuthedUser().userId}) when creating new state (${firebaseUser.uid}).`);
      await this.clearUserState()/*force expected state*/;
    } /* else -- no existing User state as expected */

    this.firebaseUser = firebaseUser;
    this.userId = firebaseUser.uid/*by contract*/;

    // TODO: it's possible to simultaneously create AuthedUserService and allow it
    //       get started while letting the claims get pulled. In this case, this
    //       *MUST* clear the current Custom Claims so that the new user doesn't
    //       see any the previous User's claims
    await this.forceTokenRefresh(true/*force for sanity since changed*/)/*update first before creating delegate (to ensure latest / consistent claims)*/;
    this.authedUserService = new AuthedUserService(this.parentContexts, firebaseUser, this.customClaims$);
    this.authedUserStateUnsubscribable =
      this.authedUserService.authedUserState$
        .subscribe(this.authedUserState$);
  }

  // either the User explicitly logged out or implicitly logged out by logging in
  // as another User
  private async clearUserState() {
    if(this.authedUserService === undefined) return/*there was no existing User*/;

    // NOTE: because the shutdown is async, it's possible re-enter this method
    //       (usually via the Firestore event handler) a second time while shutdown
    //       occurring. By clearing the AuthedUserService first (and keeping a
    //       local reference so it doesn't change out below this), it ensures
    //       re-entry is avoided by the above early return
    const authedUserService = this.authedUserService;
    this.authedUserStateUnsubscribable?.unsubscribe();
    this.authedUserStateUnsubscribable = undefined/*reset by contract*/;
    this.authedUserService = undefined/*reset by contract*/;
    await authedUserService.shutdown();

    this.forceInitialState();
  }

  // ..............................................................................
  // forces a new initial (not logged in) state
  private forceInitialState() {
    if(this.authedUserService !== undefined) log.error(`${this.logContext()} Existing AuthedUser state (${this.authedUserService.getAuthedUser().userId}) when forcing log out.`);

    this.userId = null/*clear / reset*/;
    this.firebaseUser = null/*clear / reset*/;
    clearAuthSessionCookie()/*match userId state*/;

    this.customClaims$.next({/*initially empty*/});
    this.authedUserState$.next(LoggedOut/*by definition*/);
  }

  // == Firebase Auth Subscription ================================================
  private subscribeFirebaseAuth() {
    // NOTE #onIdTokenChanged() is required since this explicitly reads the token
    //      for Firebase Custom Claims (and Session Cookie)
    // TODO:  wrap all of this in a retry mechanism if an error occurs
    this.firebaseAuthUnsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      this.idTokenChangedQueue.push(firebaseUser);

      if(this.idTokenChangedQueue.length > 1) {
        log.debug(`${this.logContext()} Already processing id-token change (${this.idTokenChangedQueue.length}). Letting existing callback finish.`);
        return/*already processing in another callback*/;
      } /* else -- no other callbacks are currently processing */

      // process the queue until empty ensuring not to remove the element from the
      // queue until it's processed (so that it acts like a latch)
      while(this.idTokenChangedQueue.length > 0) {
        try {
          const firebaseUser = this.idTokenChangedQueue[0/*peek*/]/*don't remove until finished processing*/;
          await this.handleIdTokenChanged(firebaseUser);
        } finally {
          this.idTokenChangedQueue.shift()/*remove now that it's processed*/;
          if(this.idTokenChangedQueue.length > 0) log.debug(`${this.logContext()} Processing next id-token change (${this.idTokenChangedQueue.length}).`);
        }
      }
    }, async (error) => {
      log.error(`${this.logContext()} Error observing Firestore Auth token change: `, error.message);

      // force the User into a known and consistent state (specifically, logged out)
      await this.clearUserState();
    });
  }

  // ..............................................................................
  private async handleIdTokenChanged(firebaseUser: User | null) {
    if(this.isShutDown) { log.warn(`${this.logContext()} Attempting to handle Token change while shut down. Ignoring.`); return/*do nothing*/; }

    // by design this must set the AuthedUserState to reflect the current state.
    // Specifically in the case where there is initially no User, this must explicitly
    // #forceInitialState() so that it's set to LoggedOut. If there initially is a
    // User then AuthedUserState is simply set to that new state

    // NOTE: the Custom Claims cannot be immediately updated because the specified
    //       User may be different than the current one and updating the claims
    //       would propagate / associate them with the wrong User

    // NOTE: in theory this should exit early as soon as `this.idTokenChangedQueue.length > 0`
    //       since there is a more recent state that should be used instead.
    //       The problem is that it's not understood what happens when states are
    //       skipped -- especially if those skipped states confuse the UI
    // TODO: figure out above collapsing!

    // by design if the User changed then the existing state must be cleared
    // so that there's never the chance of a partially-updated state
    const initialState = ((this.firebaseUser === undefined) && (firebaseUser === null));
    const changedUser = ( (!!this.firebaseUser !== !!firebaseUser)/*different state*/ ||
                          (!!firebaseUser && (this.userId !== firebaseUser.uid))/*different User*/ );
    log.debug(`${this.logContext()} Updated Firebase User or token (${changedUser ? 'NewUser' : 'Unchanged'}: ${this.debugFirebaseUser(firebaseUser)}; Was: ${this.debugFirebaseUser(this.firebaseUser)})`);
    if(initialState) {
      // NOTE: this is required to ensure that the Observable emits an event when
      //       the User is logged out when this handler is called for the first time
      this.forceInitialState();
    } else if(changedUser) {
      if(!!this.firebaseUser && !!firebaseUser) log.error(`${this.logContext()} Missed an implicit logout. Permission Denied errors may occur as the previous User is logged out.`)/*sanity data integrity check -- see #signOut()*/;

      // clear any existing User's state
      await this.clearUserState();

      // create a new AuthedUserService if there is a User
      if(!!firebaseUser) {
        await this.createUserState(firebaseUser);
      } /* else -- there isn't a new Firebase User */
    } else if(!!firebaseUser) { /*has a Firebase User but it didn't change*/
      await this.forceTokenRefresh(false/*only token update*/);
    } /* else -- no firebaseUser */
  }

  // ..............................................................................
  private debugFirebaseUser(user: User | null | undefined) {
    if(!user) return `<none>`;
    return `{uid:${user.uid},email:${user.email},emailVerified:${user.emailVerified}}`;
  }

  // == Observable ================================================================
  public onAuthUser$() {
    return this.authedUserState$.pipe(tap(authedUserState => this.currentAuthedUserState = authedUserState)/*ensure that local state is always set first*/);
  }

  // == Explicit LogOut ===========================================================
  // NOTE: internal use only. Service consumers *must* use firebase/auth: signOut()
  // NOTE: because firebase.auth.onIdTokenChanged() is fired only after the User
  //       has already changed, this method is necessary to allow the internal state
  //       to be cleaned up *before* the User is swapped out. Specifically, any
  //       method that implicitly signs out a User and explicitly signs in a new one
  //       *must* call this method.
  public async signOut() {
    // NOTE: because this method can be called at any time (from any state), it
    //       must be tolerant and resilient to being in any state

    await this.clearUserState();
  }

  // == Token Refresh =============================================================
  // the Firebase Auth token is refreshed due to an update to Custom Claims (i.e. roles)
  // NOTE: currently the fact that the token updated is communicated to AuthedUserService
  //       by updating customClaims$
  public async forceTokenRefresh(force: boolean) {
    const firebaseUser = this.firebaseUser/*local copy as the user can be swapped at any time!*/;
    if(!firebaseUser) { log.warn(`${this.logContext()} There is no Firebase User whose token can be refreshed.`); return/*nothing to do */; }

    if(force === true) {
      try {
        await firebaseUser.reload()/*required to read (possibly) new state*/;
      } catch(error) {
        log.error(`${this.logContext()} Error reloading authentication token. Clearing state. Reason: `, error);
        // NOTE:  this doesn't clear the entire state since it's potentially
        //        recoverable (on the next token change). The user will appear
        //        to be logged out so the net result to the UI is the same.
        this.customClaims$.error({/*clear by contract*/});
        return/*don't continue*/;
      }
    } /* else -- not a force-reload */

    try {
      // re-read the Firebase token and use it to keep the Session cookie in sync
      // and convert the Custom Claims into UserRoles
      const idToken = await firebaseUser.getIdTokenResult(force);
      const userRoles = userRolesFromCustomClaims(idToken.claims as UserRoles/*by definition*/);
      log.debug(`${this.logContext()} Refreshed user: ${this.debugFirebaseUser(firebaseUser)}; Roles: ${JSON.stringify(userRoles)}`);

      setAuthSessionCookie(idToken.token)/*keep in sync*/;
      this.customClaims$.next(userRoles);
    } catch(error) {
      log.error(`${this.logContext()} Couldn't read Firebase authentication token for User (${firebaseUser.uid}). Clearing roles. Reason: `, error);
      // NOTE:  this doesn't clear the entire User State since it may recover on
      //        the next token update
      this.customClaims$.error({/*clear by contract*/});
      return/*don't continue*/;
    }
  }

  // == Stats =====================================================================
  public stats(): any {
    if(this.authedUserService === undefined) return {/*none*/};
    return { ...this.authedUserService.stats() };
  }
}

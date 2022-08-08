import { Observable } from 'rxjs';

import { AuthedUser, UserRole } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { ApplicationError } from '../util/error';
import { updateUserProfilePrivate } from './function';
import { isLoggedIn, AuthedUserState, UserProfilePrivate_Update } from './type';
import { FirebaseAuthService } from './support/FirebaseAuthService';

const log = getLogger(ServiceLogger.AUTH_USER);

// ********************************************************************************
/**
 * An Authorized User service that encapsulates all logic necessary to load, cache,
 * receive updates to, modify, etc. the logged in User and their associated information.
 * An Authorized User (Auth'd User) is a User that is logged in and has a
 * {@link UserProfilePrivate}.
 *
 * Updates are received and processed as long as this service exists and before
 * {@link AuthUserService#shutdown()} is called.
 *
 * A unified view of the Auth'd User is presented in an all-or-nothing manner. There
 * is never a time when logging in or out or switching Users that the state is in
 * an inconsistent state.) Only a single Auth'd User may exist at any time.
 *
 * The biggest challenge to understanding this service and how Firebase Auth works
 * involves the fact that there is no-pre-User-changed hook. In the case where
 * auth is set up per browser (rather than per browser tab) then it's possible to
 * be logged in as User A in tab #1 and then open tab #2 and log in as User B.
 * When this occurs, the {@link AuthUserService} in tab #1 will get an Auth event
 * that simply shows that the User has -already- changed (to User B). In cases like
 * this, there is much UI state that currently refers to User A and it must be
 * cleaned up. Unfortunately, this clean up will happen in the context of User B
 * (since the auth has -already- changed). If there are "Are You Sure?"-style cases
 * then they all must be aborted since content -cannot- be saved (since that
 * content is for User A but the auth currently is for User B)! From this service's
 * standpoint, it tries to present a sane model to the UI. When this immediate
 * change from User A to User B occurs then this service will provide a synthetic
 * 'log out' event that the UI can react to and then it will give a 'log in' event
 * for User B.
 *
 * Access this via the {@link AuthUserService#getInstance()} singleton accessor.
 */
export class AuthUserService {
  private readonly firebaseAuthService = new FirebaseAuthService();

  // == Singleton =================================================================
  private static singleton: AuthUserService;
  public static create() { return (AuthUserService.singleton = new AuthUserService()); }
  public static getInstance() { return AuthUserService.singleton; }

  // == Life-Cycle ================================================================
  protected constructor() {/*nothing additional*/}

  /**
   * Shuts down the Authorized User sub-system. Shutting down an already shut-down
   * sub-system has no effect. This may need to persist state on shutdown so it is
   * strongly recommended that this step is not skipped.
   */
  public async shutdown() {
    log.error(`Shutting down Auth User service ...`);

    await this.firebaseAuthService.shutdown();

    log.info(`Complete.`);
  }

  // == Observables ===============================================================
  // -- Connected -----------------------------------------------------------------
  // TODO: once the connected state detector is at the right level
  // /**
  //  * @returns Observable over the connected state where `true` means 'connected'
  //  *          ('online') and `false` means 'disconnected' ('offline')
  //  */
  // public onConnected$(): Observable<boolean> {
  //   return this.firebaseAuthService.onConnected$();
  // }

  // -- Auth User -----------------------------------------------------------------
  /**
   * The following pipe can be used to only detect if the User has logged in / out:
   * <code>
      map(authedUserState => (authedUserState === LoggedOut) ? null : authedUserState.authedUser),
      distinctUntilChanged() // filter out changes from other elements
   * </code>
   *
   * @returns Observable over {@link AuthedUserState}
   */
  public onAuthUser$(): Observable<AuthedUserState> {
    return this.firebaseAuthService.onAuthUser$();
  }

  // == Explicit LogOut ===========================================================
  // NOTE: this method is for internal use only. Service consumers *must* use
  //       firebase/auth: signOut()
  // NOTE: because firebase.auth.onIdTokenChanged() is fired only after the User
  //       has already changed, this method is necessary to allow the internal state
  //       to be cleaned up *before* the User is swapped out. Specifically, any
  //       method that implicitly signs out a User and explicitly signs in a new one
  //       *must* call this method.
  public async signOut() {
    await this.firebaseAuthService.signOut();
  }

  // CHECK: should login() and logout() exist on this service so that it has immediate
  //        knowledge of the login and logout process?

  // == Token Refresh =============================================================
  /**
   * @param force refreshes the tokens (typically to account for an update to the
   *        User's Roles). If true then the tokens will be force-refreshed.
   */
  public async forceTokenRefresh(force: boolean) {
    await this.firebaseAuthService.forceTokenRefresh(force);
  }

  // == Convenience Methods =======================================================
  /**
   * @returns the current {@link AuthedUser} or `null` if the User is not logged in
   *          or the state for the current User is still being loaded. This value
   *          always *leads* {@link #onAuthedUser()} so care is needed in transition
   *          cases such as logging out
   * @see #onAuthedUser()
   */
  public getAuthUser(): AuthedUser | null {
    const authedUserState = this.firebaseAuthService.getCurrentAuthedUserState();
    if(!isLoggedIn(authedUserState)) return null/*by contract*/;
    return { ...authedUserState.authedUser }/*clone*/;
  }

  /**
   * @param otherUser the other {@link AuthedUser} (or none) to compare the current
   *        state against
   * @returns `true` if and only if the current {@link AuthedUser} matches the
   *          specified one or if both Users represented a logged out state.
   *          `false` otherwise.
   */
  public isSameAuthUser(otherUser: AuthedUser | null): boolean {
    const thisUser = this.getAuthUser()/*ensure 'is valid' semantics*/;
    const thisUserId = !!thisUser ? thisUser.userId : null/*no User*/;
    if(!thisUserId && !otherUser) return true/*both logged out*/;
    if(!thisUserId || !otherUser) return false/*one is logged out*/;
    return (thisUserId === otherUser.userId);
  }

  // -- Role-based Methods --------------------------------------------------------
  /**
   * @param role the {@link UserRole} being tested
   * @returns `true` if and only if the there is an AuthUser and that User *currently*
   *          possesses the specified {@link UserRole}. Please note that this may
   *          differ from the roles available in the Custom Claims due to latency.
   *          This value always *leads* {@link #onAuthedUser()} so care is needed
   *          in transition cases such as logging out.
   */
  public hasRole(role: UserRole): boolean {
    const authedUserState = this.firebaseAuthService.getCurrentAuthedUserState();
    if(!isLoggedIn(authedUserState)) return false/*by contract*/;
    return !!authedUserState.userRoles[role]/*from Custom Claims by contract (by specifically only those that are visible)*/;
  }

  // == User ======================================================================
  /**
   * @param update updates the User's {@link UserProfilePrivate} based on the
   *        specified update. The specified update is *merged* with the current data.
   *        Fields that are specified in the update are overwritten with the
   *        specified value. If that value is `null` or `undefined` then that field
   *        is removed. Any fields that are not specified (as allowed by the Schema)
   *        in the update remain unchanged. Nested objects are treated the same as
   *        the top-level objects.
   * @throws {@link ApplicationError}
   * - `data/deleted'` if the User has already been deleted
   * - `datastore/read` if the underlying datastore was not available
   * - `datastore/write` if the underlying datastore was not available
   * - 'functions/internal' if called on an invalid (likely logged out) state
   */
  public async updateProfile(update: UserProfilePrivate_Update) {
    const authedUserState = this.firebaseAuthService.getCurrentAuthedUserState();
    if(!isLoggedIn(authedUserState)) throw new ApplicationError('functions/internal', `AuthUser state is not valid. Likely User (${this.firebaseAuthService.getUserId()}) has logged out.`);
    await updateUserProfilePrivate(update);
  }

  // == Stats =====================================================================
  public stats(): any { return this.firebaseAuthService.stats(); }
}

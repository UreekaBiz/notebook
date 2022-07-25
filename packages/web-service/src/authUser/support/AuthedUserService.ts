import { User } from 'firebase/auth';
import { combineLatest, BehaviorSubject, Observable, Subject, Unsubscribable } from 'rxjs';
import { map } from 'rxjs/operators';

import { generateUuid, isType, UserProfilePrivate, UserRole, UserRoles } from '@ureeka-notebook/service-common';

import { subjectStats } from '../../util/observable';
import { AbstractService } from '../../util/AbstractService';
import { profilePrivate$ } from '../observable';
import { AuthedUser, LoggedInUserState } from '../type';
import SessionService from './SessionService';

// AuthUserService delegate that is per-User (whereas AuthUserService is across
// multiple User logins)
// ********************************************************************************
export class AuthedUserService extends AbstractService{
  private readonly authedUser: AuthedUser;
  public getAuthedUser() { return this.authedUser; }

  // ..............................................................................
  private readonly sessionService: SessionService/*has per-User/Session lifetime*/;

  // .. Dependent Data ............................................................
  // Custom Claims (from the Firebase token) is the source of truth for the User's
  // (as the UserRoles)
  private readonly customClaims$ = new BehaviorSubject<UserRoles>({/*initially empty*/});
  private readonly customClaimsUnsubscribable: Unsubscribable;

  // required data
  private readonly profilePrivate$ = new Subject<UserProfilePrivate | null/*doesn't exist yet*/>();
  private readonly profilePrivateUnsubscribable: Unsubscribable;

  // ==============================================================================
  public constructor(parentContexts: string[], firebaseUser: User, customClaims$: Observable<UserRoles>/*input*/) {
    super(...parentContexts);

    this.authedUser = isType<AuthedUser>({
      userId: firebaseUser.uid/*by contract*/,
      sessionId: generateUuid(),
    });

    this.sessionService = new SessionService(this.parentContexts, this.authedUser.userId, this.authedUser.sessionId);

    // observables
    this.customClaimsUnsubscribable =
      customClaims$
        .subscribe(this.customClaims$);
    this.profilePrivateUnsubscribable =
      profilePrivate$(this.authedUser.userId)
        .subscribe(this.profilePrivate$);
  }

  // resets the state if the User logs out, is forced to log out on error or if
  // a new User is logged in (effectively implicitly logging out the old User and
  // logging in the new one)
  // NOTE:  this ensures that all dependent listeners are released and ensures that
  //        a partial state is never sent
  public async shutdown() {
    // CHECK: in most cases the User will have already been logged out so any
    //        cleanup by the SessionService will not happen in the correct context
    await this.sessionService.shutdown();

    this.profilePrivateUnsubscribable.unsubscribe();
    this.customClaimsUnsubscribable.unsubscribe();
  }

  // == Observables ===============================================================
  // -- AuthedUser ----------------------------------------------------------------
  public get authedUserState$() {
    // NOTE: by design this waits until all Observables have had their first value
    //       before returning
    // NOTE: because the User may be swapped out at any time, it is possible for
    //       any Observable to throw a PermissionDenied error (which is bubbled out
    //       for AuthUserService to handle)
    return combineLatest([
        this.customClaims$,

        this.profilePrivate$,
      ])
      .pipe(map(value => this.computeAuthedUserState(value)));
      // NOTE: using this.computeAuthedUserState.bind(this) prevents TypeScript
      //       from detecting if there is a type mismatch
  }

  // ..............................................................................
  // one of the specified Observables has changed so the resulting state is computed
  private computeAuthedUserState([ customClaims, profilePrivate ]: [ UserRoles, UserProfilePrivate | null/*doesn't exist yet*/ ]) {
    // NOTE: if the User Profile Private won't exist yet if the User just registered
    //       and the Auth on-create hook is still creating the User
    if(!profilePrivate) return null/*logged in but Private Profile doesn't exist yet*/;

    const userRoles = Object.values(UserRole).reduce((o, role) => ({ ...o, [role]: customClaims[role] }), {} as UserRoles);
    return isType<LoggedInUserState>({
      authedUser: this.authedUser,
      userRoles,

      profilePrivate,
    });
  }

  // -- Connected -----------------------------------------------------------------
  public get connected$() { return this.sessionService.connected$; }

  // == Stats =====================================================================
  public stats() { return {
    sessionStats: this.sessionService.stats(),

    profilePrivateStats: subjectStats(this.profilePrivate$),
  }; }
}

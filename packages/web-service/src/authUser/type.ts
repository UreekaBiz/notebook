import { SessionIdentifier, UserIdentifier, UserProfilePrivate, UserProfilePrivateUpdate_Rest, UserProfilePrivateUpdate_Rest_Schema, UserRoles } from '@ureeka-notebook/service-common';

// ********************************************************************************
// == Convenience Types ===========================================================
// the system can be in one and only one of the following states:
// 1. No user is logged in:
//      AuthedUserState = null
//      AuthedUser = undefined
// 2. User is logged in:
//      AuthedUserState = LoggedInUserState
//      AuthedUser != undefined

// an authenticated (logged-in) user
export type AuthedUser = Readonly<{
  userId: UserIdentifier;
  sessionId: SessionIdentifier;
}>;

// ................................................................................
// the overall user state (both auth'd and unauth'd)
export const LoggedOut = null/*sentinel*/;
export type LoggedOutUserState = null/*sentinel*/;
export type LoggedInUserState = Readonly<{
  /** guaranteed to be `===` as long as the members are `===` */
  authedUser: AuthedUser;
  userRoles: UserRoles;
  profilePrivate: UserProfilePrivate;
}>;
export type AuthedUserState =
  | LoggedOutUserState
  | LoggedInUserState
  ;

// convenience type-guards for AuthedUserState
export const isLoggedOut = (state: AuthedUserState): state is LoggedOutUserState => (state === LoggedOut);
export const isLoggedIn = (state: AuthedUserState): state is LoggedInUserState => (state !== LoggedOut);

// == Action Types ================================================================
export const UserProfilePrivate_Update_Schema = UserProfilePrivateUpdate_Rest_Schema;
export type UserProfilePrivate_Update = UserProfilePrivateUpdate_Rest;

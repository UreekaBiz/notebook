import { FieldValue } from '../util/firestore';
import { nameof } from '../util/object';
import { DatabaseTimestamp } from '../util/rtdb';
import { Modify } from '../util/type';
import { UserIdentifier } from '../util/user';
import { Session, SessionIdentifier, UserProfilePrivate, UserSession } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// -- User Profile Private --------------------------------------------------------
// NOTE: odd naming to match the conventions
// SEE: ../user/datastore.ts
export const USER_PROFILE_PRIVATES = 'user-profile-privates'/*top-level collection*/;
export const USER_PROFILE_PRIVATE = `${USER_PROFILE_PRIVATES}/{userId}` as const/*document (used by CF triggers)*/;

// -- Trigger Context -------------------------------------------------------------
export type UserProfilePrivateParams = Readonly<{
  userId/*NOTE: must match #USER_PROFILE_PRIVATE*/: UserIdentifier;
}>;

// == RTDB ========================================================================
// -- Connected -------------------------------------------------------------------
// REF: https://firebase.google.com/docs/database/web/offline-capabilities#section-presence
export const CLIENT_CONNECTED = '.info/connected'/*Firebase system path*/;

// -- Session ---------------------------------------------------------------------
export const USER_SESSIONS = 'user-sessions'/*top-level 'collection'*/;
export const USER_SESSIONS_USER = `${USER_SESSIONS}/{userId}`/*'document'*/;
export const SESSIONS = nameof<UserSession>('sessions')/*nested 'collection'*/;
export const USER_SESSIONS_USER_SESSIONS = `${USER_SESSIONS_USER}/${SESSIONS}`/*'collection'*/;
export const USER_SESSIONS_USER_SESSION = `${USER_SESSIONS_USER_SESSIONS}/{sessionId}`/*'document'*/;

// -- Trigger Context -------------------------------------------------------------
export type UserSessionUsersParams = Readonly<{
  userId/*NOTE: must match #USER_SESSIONS_USER*/: UserIdentifier;
}>;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- User Profile Private --------------------------------------------------------
export type UserProfilePrivate_Storage = UserProfilePrivate/*nothing additional*/;

// == RTDB ========================================================================
// -- Session ---------------------------------------------------------------------
// NOTE: Firebase recommended approach for updating RTDB fields (i.e. update by key)
export const userKey = (userId: UserIdentifier) => `/${USER_SESSIONS}/${userId}`;
export const sessionKey = (sessionId: SessionIdentifier) => `/${SESSIONS}/${sessionId}`;
export const userSessionKey = (userId: UserIdentifier, sessionId: SessionIdentifier) => `${userKey(userId)}${sessionKey(sessionId)}`;
export const sessionTimestampKey = (sessionId: SessionIdentifier) => `${sessionKey(sessionId)}/${nameof<Session>('timestamp')}`;

// ................................................................................
export type UserSession_Storage = UserSession/*nothing additional*/;
export type Session_Storage = Session/*nothing additional*/;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- User Profile Private --------------------------------------------------------
export type UserProfilePrivate_Create = Modify<UserProfilePrivate_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;

export type UserProfilePrivate_Update =
    Partial<Omit<UserProfilePrivate_Storage, 'deleted'/*can't delete in update*/ | 'updateTimestamp'>>
  & Modify<Pick<UserProfilePrivate_Storage, 'updateTimestamp'>, Readonly<{
      updateTimestamp: FieldValue/*always-write server-set*/;
    }>>;

export type UserProfilePrivate_Delete = Modify<Pick<UserProfilePrivate_Storage, 'deleted' | 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;

// == RTDB ========================================================================
// -- Session ---------------------------------------------------------------------
export type UserSession_Write = Modify<Partial<UserSession_Storage>, Readonly<{
  oldestSessionTimestamp?: DatabaseTimestamp/*computed*/;

  timestamp: DatabaseTimestamp/*server-set*/;
}>>;
export type Session_Write = Modify<Partial<Session_Storage>, Readonly<{
  timestamp: DatabaseTimestamp/*server-set*/;
}>>;

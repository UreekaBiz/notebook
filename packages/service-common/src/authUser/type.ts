import * as Validate from 'yup';

import { UserProfile_Core, UserProfile_Internal, UserProfile_Private } from '../user/type';
import { Creatable, Updatable } from '../util/datastore';
import { RTDBTimestamp } from '../util/rtdb';
import { Identifier, Modify } from '../util/type';
import { UserIdentifier } from '../util/user';

// ********************************************************************************
// SEE: ../util/user.ts for UserIdentifier

// == Deleted User ================================================================
// NOTE: two constraints drive this:
//       1. What is the abbreviation (e.g. Former User = FU => BAD!)?
//       2. What is the first name since it's used some contexts
export const DELETED_USER_FIRST_NAME = 'Former';
export const DELETED_USER_LAST_NAME = 'Dev';

// == Roles =======================================================================
/** roles are best thought of as permissions. They are communicated via the Custom
 *  Claims and are used on both the client and the server for authorization. */
export enum UserRole {
  Admin = 'admin',

  /** Free and Paid are mutually exclusive. If for some reason both should ever
   *  appear then Paid has precedence */
  Free = 'free'/*all Users are set to the 'free' tier by default*/,
  Paid = 'paid',
}

// NOTE:  this cannot be 'readonly' as there is no obvious way to programmatically
//        build up a set of roles from the User's Private Profile.
export type UserRoles = {
  // all roles are optional. Those that are present (and explicitly set to 'true')
  // define the set of roles that the user has. All code is written such that if
  // a role is not present, it is assumed to be 'false' -- there are no 'false'
  // roles
  [P in UserRole]?: true;
};

// .. Admin .......................................................................
export const isAdminRole = (role: UserRole) => {
  switch(role) {
    case UserRole.Admin:
    // add more UserRoles here that are Admin roles
      return true/*is Admin Role*/;
  }
  return false/*not an Admin role*/;
};

// == Cookies =====================================================================
export const SESSION_COOKIE = '__session';

// == User-Session ================================================================
export enum PresenceState {
  Active = 'active'/*and online*/,
  Idle = 'idle'/*and online*/,
  Offline = 'offline',
}

// ................................................................................
// this is designed to allow a single User to be associated with multiple Sessions
// (e.g. multiple different browsers). The User's presence is stored at the User
// level and is an aggregate of all of the Sessions. If no Sessions then offline.
// If at least one Session is active then active. Etc. This aggregation is performed
// by an on-write trigger to isolate the logic from the User / client.
// NOTE: a Session for a new User may appear and disappear such that the on-write
//       trigger does not know about it (specifically it would be triggered but
//       there may be no data for it to react to). This is fine since the result
//       is that that Session is logged out and hence doesn't contribute to the
//       overall presence.
// SEE: @ureeka-notebook/cloud-functions: authUser/onWrite.ts

export type UserSessions = { /*RTDB only*/
  readonly [userId: string/*UserIdentifier*/]: UserSession;
};

// User-Session data in the RTDB that is read and written by the User themselves
// (via the SessionService). It is most commonly used to compute the presence state
// of the User. To allow that computed state to be read by other Users, it is cloned
// into the User's Private Profile (which in turn is cloned into the Public Profile).
export type UserSession = Readonly<{ /*RTDB only*/
  /** the {@link PresenceState} of the User as an aggregate of the Sessions */
  // NOTE: updated via on-write trigger
  presenceState: PresenceState;

  /** Sessions as written by the User */
  sessions?: UserSessionSessions;
  /** the oldest (smallest) timestamp of the Sessions or `undefined` if there are none */
  // NOTE: this is required by the RTDB index (which can only index at the top level)
  // NOTE: updated via on-write trigger and bubbled up from the Sessions timestamps
  // NOTE: if updated then the RTDB Rules must be updated
  oldestSessionTimestamp?: RTDBTimestamp/*server-written*/;

  /** timestamp at which this record is written */
  timestamp: RTDBTimestamp/*server-written on each update*/;
}>;

// ................................................................................
// SessionId's are generated by the client (as a v4 GUID) when a new User is detected.
// NOTE: it is possible for a Session to be deleted and recreated with the same
//       SessionIdentifier. This is due to the fact that a single Client may go
//       offline and then come back online.
export type UserSessionSessions = { /*RTDB only*/
  readonly [sessionId: string/*SessionIdentifier*/]: Session;
};

// -- Session ---------------------------------------------------------------------
export type SessionIdentifier = Identifier;

// ................................................................................
export enum ActivityState {
  Active = 'active',
  Idle = 'idle',
}

// ................................................................................
export const Session_Schema = Validate.object({ /*RTDB only*/
  activity: Validate.string()
          .oneOf(Object.values(ActivityState))
          .required(),

  timestamp: Validate.number()/*(time since the Unix epoch, in milliseconds) RTDB server-written*/
          .required(),
}).noUnknown();
export type Session = Readonly<Modify<Validate.InferType<typeof Session_Schema>, {
  activity: ActivityState/*explicit*/;
}>>;

// == Auth'ed User ================================================================
// an authenticated (logged-in) User
// NOTE: this is primarily used on the client but was made common to ensure that
//       functions that include the Session can be made common as well
export type AuthedUser = Readonly<{
  userId: UserIdentifier;
  sessionId: SessionIdentifier;
}>;

// == Private Profile =============================================================
export type UserProfilePrivate =
    Creatable
  & Updatable
  & UserProfile_Core
  & UserProfile_Internal/*'internal' only refers to how they're updated*/
    // NOTE: does *not* include UserProfile_Generated since only in public profile
    //       generated from the private profile
  & UserProfile_Private
  & Readonly<{ /*fields that exist *only* in the Private Profile*/
      // NOTE: this breaks with the usual paradigm of not including the document's
      //       id (or any parent id) on the document itself. This was done specifically
      //       so that lookups by email, etc. could be used to find users (i.e. for
      //       administrative purposes)
      userId: UserIdentifier;

      /** the source-of-truth for the User's Roles. If these are changed then an
       *  on-write trigger updates the Custom Claims. */
      roles: UserRole[];
    }>
  ;

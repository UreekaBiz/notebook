import { logger } from 'firebase-functions';

import { difference, sessionKey, ActivityState, DeleteRecord, PresenceState, UserIdentifier, UserSession, UserSession_Write } from '@ureeka-notebook/service-common';

import { DatabaseTimestamp } from '../util/rtdb';
import { userSessionRef } from './datastore';
import { updateUserPrivateProfile } from './userProfilePrivate';

// User-Session
// ********************************************************************************
// NOTE: called on *every* change (even if not the latest) -- be cognizant of
//       operations that require order between calls
export const changedUserSession = async (userId: UserIdentifier, before: UserSession | null/*new*/, after: UserSession) => {
  // determine which, if any, Session changed (either came online or went offline)
  // NOTE: there are only three types of changes at this level
  //       1. New Session Id: Session came online
  //       2. Removed Session id: Session went offline
  //       3. Presence state changed (effectively as a result of the two above)
  const sessionIdsRemoved = difference(getSessionIds(before), getSessionIds(after));
  if(sessionIdsRemoved.length > 0) {
    await Promise.all(sessionIdsRemoved.map(async sessionId => {
      logger.info(`Session (${sessionId}) for User (${userId}) logged out / went offline.`);

      // TODO: put any dependencies here that depend on cleaning up when the User
      //       logs off or goes offline
    }));
  } /* else -- either the Session state changed or a new Session logged in (i.e. a Session was -added-) */
};

// --------------------------------------------------------------------------------
// this is the latest change to the User-Session. If the state changed then:
// 1. update summary information at the User-level
// 2. copy that summary info to Firestore
// 3. inform others of the nature of the change
// SEE: @ureeka-notebook/web-service: authUser/support/SessionService.ts
export const updateUserSession = async (userId: UserIdentifier, userSession: UserSession) => {
  const oldestSessionTimestamp = computeOldestSessionTimestamp(userSession);
  const presenceState = computePresenceState(userSession);

//logger.info(`updateUserSession: ${userId}; ${JSON.stringify(user)}: ${oldestSessionTimestamp}; ${presenceState}`);
  // determine if the state has changed (either oldest Session timestamp or presence)
  if(    (oldestSessionTimestamp !== userSession.oldestSessionTimestamp)
      || (presenceState !== userSession.presenceState) ) {
//logger.info(`Presence or oldest Session timestamp have changed: ${JSON.stringify(user)}`);
    try {
      const summary: Partial<UserSession_Write>/*see NOTE below*/ = {
        presenceState,

        oldestSessionTimestamp: (oldestSessionTimestamp === undefined) ? DeleteRecord/*clear / none*/ : oldestSessionTimestamp,
        // NOTE:  *DO NOT* update 'timestamp' (specifically with DatabaseTimestamp)
        //        as that would cause an infinite loop (since this is typically called
        //        from an on-write trigger)!!!
      };
      await userSessionRef(userId).update(summary);
    } catch(error) {
      logger.error('datastore/write', `Error writing User-level presence to RTDB for User (${userId}). Reason: `, error);
      return/*nothing else could / should be done (while guaranteeing data integrity)*/;
    }

    // propagate to Firebase (specifically the User System Configuration whose update
    // will cascade to other objects based on triggers (e.g. User Public Profile))
    if(presenceState !== userSession.presenceState) {
      await updateUserPrivateProfile(userId, { presence: presenceState })/*logs on error*/;
    } /* else -- the presence state hasn't changed */
  } /* else -- the state did not change */
};

// --------------------------------------------------------------------------------
// retrieves the Session Ids associated with the specified User-Session
const getSessionIds = (userSession: UserSession | null | undefined) => {
  if(!userSession) return []/*none by definition*/;

  const sessions = userSession.sessions/*for convenience*/;
  const newSessionIds = (sessions === undefined) ? []/*none by definition*/ : Object.keys(sessions);
  return newSessionIds.slice()/*clone*/;
};

// ................................................................................
// a User is Offline if they have no Session. If any Session is Active then the
// User is Active. Otherwise the User is Idle
const computePresenceState = (userSession: UserSession) => {
//logger.info(`Sessions: ${JSON.stringify(userSession)}`);
  const sessions = userSession.sessions/*for convenience*/;
  const newSessions = (sessions === undefined) ? []/*none by definition*/ : Object.values(sessions);
  if(newSessions.length < 1) return PresenceState.Offline/*no Sessions*/;

  for(const session of newSessions) {
    if(session.activity === ActivityState.Active) {
      return PresenceState.Active/*any Active means not Idle (Active)*/;
    } /* else -- activity is Idle */
  }
  return PresenceState.Idle/*there were Sessions and they were all Idle*/;
};

// ................................................................................
// finds and returns the oldest Session timestamp. If there are no Sessions then
// `undefined` is returned
// NOTE: 'oldest' means 'smallest'
const computeOldestSessionTimestamp = (userSession: UserSession) => {
  let oldestTimestamp = Number.MAX_VALUE/*impossible value (and a sentinel)*/;
  const sessions = userSession.sessions/*for convenience*/;
  const newSessions = (sessions === undefined) ? []/*none by definition*/ : Object.values(sessions);
  for(const session of newSessions) {
    oldestTimestamp = Math.min(oldestTimestamp, session.timestamp);
  }
  return (oldestTimestamp === Number.MAX_VALUE) ? undefined/*by contract (none)*/ : oldestTimestamp;
};

// == Delete ======================================================================
// checks all Sessions associated with the specified User-Session. Any that have
// timed out are removed (en masse).
// NOTE: presence state is *not* computed here -- #onWriteUserSessionUser() handles
// NOTE: this must *NOT* be called be called from an on-write trigger as it writes
//       the timestamp (which would cause a cycle)
export const deleteExpiredSessions = async (userId: UserIdentifier, userSession: UserSession, maxAge: number/*millis since epoch*/) => {
  // check each Session's timestamp to see if it's younger than the timeout. If so,
  // accumulate in the records to be removed
  let changed = false/*there is no change in the UserSession by default*/;
  const deletedSessions: Record<string/*sessionKey*/, typeof DeleteRecord> = {};
  const sessions = userSession.sessions/*for convenience*/;
  if(sessions !== undefined) {
    for(const sessionId in sessions) {
      const session = sessions[sessionId];
//logger.info(`Session (${sessionId}) for User (${userId}): ${session.timestamp} < ${maxAge}`);
      if(session.timestamp < maxAge) { /*expired since older (smaller)*/
//logger.info(`Expired session`);
        deletedSessions[sessionKey(sessionId)] = DeleteRecord/*clear session-level record*/;
        changed = true/*by definition*/;
      } /* else -- younger than the max age (so not expired) */
    }
  } /* else -- there are no Sessions associated with the UserSession */
  if(!changed) return/*nothing to do*/;

  try {
    const record: UserSession_Write = {
      ...deletedSessions,

      // NOTE: explicitly not updating 'oldestSessionTimestamp'. It will be done
      //       in #onWriteUserSessionUser()

      timestamp: DatabaseTimestamp/*write-always server-set*/,
    };
logger.info(`Writing updated User-Session for deleted / expired Session (${userId}): ${JSON.stringify(userSession)} as ${JSON.stringify(record)}`);
    await userSessionRef(userId).update(record);
  } catch(error) {
    logger.error(`Error writing User-Session for User (${userId}). Reason: `, error);
  }
};

import { logger } from 'firebase-functions';

import { SessionIdentifier, UserIdentifier, UserSessions } from '@ureeka-notebook/service-common';

import { deleteExpiredNotebookUserSessions } from '../notebook/userSession';
import { expiredUserSessionsQuery } from './datastore';
import { deleteExpiredSessions } from './userSession';

// User-Sessions (across User-Session)
// ********************************************************************************
// the maximum number of User-Sessions that are checked for Session timeout per
// call (bounding for sanity)
// CHECK: make a config param?
const MAX_USERS_PER_CHECK = 10000/*SWAG*/;

// ===============================================================================
export const deleteExpiredUserSessions = async (serverTimestamp: string, timeout: number, epsilon: number) => {
  // the oldest (smallest) timestamp that the Session can have is the server timestamp
  // minus the timeout (including the epsilon for sanity)
  const now = (new Date(serverTimestamp)/*server time*/).getTime();
  const maxAge = now - (timeout + epsilon);

  // get all UserSession's (per User) that have some Session that has expired
  let userSessions: UserSessions;
  try {
    const snapshot = await expiredUserSessionsQuery(maxAge, MAX_USERS_PER_CHECK).once('value');
    if(!snapshot.exists()) { logger.info(`No expired Sessions to delete.`); return/*nothing more to do*/; }
    userSessions = snapshot.val() as UserSessions;
//logger.debug(`Deleting expired User-Sessions: ${JSON.stringify(userSessions)}`);
  } catch(error) {
    // CHECK: should this throw so that it causes the scheduled function to re-try?
    logger.error(`Could not query User-Sessions for Session timeout. Reason: ${error}`);
    return/*nothing more to do*/;
  }

  // CHECK: parallelize with Promise.all()?
  for(const userId in userSessions) {
    const userSession = userSessions[userId];
    const deleted = await deleteExpiredSessions(userId, userSession, maxAge)/*logs on error*/;
    if(deleted) handleDependentExpiredUserSessions(userId, deleted)/*logs on error*/;
  }
};

// ................................................................................
// all operations that are dependent on a deleted User-Session are located here
// NOTE: these operations must not:
//       a) change the User-Session
//       b) depend on each other
// NOTE: see #changedUserSession() for handling *all* removed User-Sessions
const handleDependentExpiredUserSessions = async (userId: UserIdentifier, deletedSessionIds: Set<SessionIdentifier>) => {
  for(const sessionId of deletedSessionIds) {
    // !!! any and all per-Session expired cleanup items go here !!!

    await deleteExpiredNotebookUserSessions(userId, sessionId)/*logs on error*/;
  }
};

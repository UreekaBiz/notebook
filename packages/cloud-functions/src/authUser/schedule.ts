import * as functions from 'firebase-functions';

import { getEnv } from '../util/environment';
import { wrapOnRun, LargeMemory } from '../util/function';
import { deleteExpiredUserSessions } from './userSessions';

// ********************************************************************************

// ********************************************************************************
const timeout = Math.max(0, Number(getEnv('NEXT_PUBLIC_SESSION_UPDATE_INTERVAL', '300'/*s*/))) * 1000/*ms*/;
const epsilon = Math.max(0, Number(getEnv('SESSION_EXPIRATION_EPSILON', '60'/*s*/))) * 1000/*ms*/;

// checks if there are Sessions that have expired. The client updates the Session
// timestamp every NEXT_PUBLIC_SESSION_UPDATE_INTERVAL seconds. If there is a
// Session that hasn't been updated in:
//   NEXT_PUBLIC_SESSION_UPDATE_INTERVAL + epsilon
// seconds then it is assumed that the Client is disconnected, dead, etc. and deletes
// that that Session. (#onWriteUserSessionUser() handles incorporating that change.)
// TODO: set the schedule based on NEXT_PUBLIC_SESSION_UPDATE_INTERVAL
export const scheduleUserSessionExpiration = functions.runWith(LargeMemory)
                                                      .pubsub.schedule('every 5 minutes').onRun(wrapOnRun(async (context) => {
  await deleteExpiredUserSessions(context.timestamp, timeout, epsilon)/*logs on error*/;
}));

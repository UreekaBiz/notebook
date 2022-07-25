import { logger } from 'firebase-functions';

import { convertUndefined, sessionKey, sessionTimestampKey, DeleteRecord, SessionIdentifier, SessionUpdate_Rest, Session_Write, UserIdentifier } from '@ureeka-notebook/service-common';

import { DatabaseTimestamp } from '../util/rtdb';
import { userSessionRef } from './datastore';

// a User-Session's Session
// ********************************************************************************
// == Session =====================================================================
export const clearSession = async (userId: UserIdentifier, sessionId: SessionIdentifier) => {
  try {
    const ref = userSessionRef(userId);
    await ref.update({
      [sessionKey(sessionId)]: DeleteRecord/*clear Session-level record*/,
      timestamp: DatabaseTimestamp/*write-always server-set*/,
    });
  } catch(error) {
    logger.error(`Error clearing RTDB Session (${sessionId}) on User-Session (${userId}). Reason: `, error);
  }
};

// ................................................................................
type Session = Partial<Omit<SessionUpdate_Rest, 'sessionId'>>/*partial is for heartbeat*/;
export const updateSession = async (userId: UserIdentifier, sessionId: SessionIdentifier, session: Session) => {
  try {
    const ref = userSessionRef(userId);
    const record: Session_Write = {
      ...Object.keys(session).reduce((o, key) => ({ ...o, [`${sessionKey(sessionId)}/${key}`]: session[key as keyof Session] }), {}),

      // both Session-level and User-Session-level timestamps must be updated by contact
      [sessionTimestampKey(sessionId)]: DatabaseTimestamp/*write-always server-set*/,
      timestamp: DatabaseTimestamp/*write-always server-set*/,
    };
    await ref.update(convertUndefined(record, DeleteRecord));
  } catch(error) {
    logger.error(`Error updating RTDB Session (${sessionId}) on User-Session (${userId}). Reason: `, error);
  }
};

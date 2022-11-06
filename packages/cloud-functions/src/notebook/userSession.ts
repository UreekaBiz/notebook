import { logger } from 'firebase-functions';

import { DeleteRecord, NotebookCollaboration_Storage, relativeNotebookUserSessionKey, SessionIdentifier, UserIdentifier } from '@ureeka-notebook/service-common';

import { notebooksRef, notebookUserSessionQuery } from './datastore';

// Notebook User-Sessions are used to record the presence and last activity of a
// User within a Notebook (Editor)
// NOTE: even though this is a Notebook Editor-centric action, it is at the Notebook
//       level to be consistent with its place in the RTDB and service-common
// ********************************************************************************
// == Delete ======================================================================
// removes any expired Notebook User-Session associated with the specified User and
// Session as long as that User and Session are not currently present (in the RTDB)
// NOTE: this is *only* a fall-back for when the RTDB #onDisconnect() handler fails
// NOTE: this is *only* called when the User-Session is deemed expired and cleaned
//       up. Due to the lack of cross-record transactions in the RTDB, it's not
//       possible to ensure that the Notebook User-Session is not removed in cases
//       where it should not be (e.g. the User-Session comes back to life). Therefore
//       this is all best-effort and not guaranteed to be correct (but fails in
//       the best possible way).
// TODO: think about if 'n' queries are better than just a single per-User query
//       where this then accepts a set of SessionIds to find and remove
export const deleteExpiredNotebookUserSessions = async (userId: UserIdentifier, sessionId: SessionIdentifier) => {
  // get all Notebook User-Session's for the User and Session
  let notebookCollaborations: NotebookCollaboration_Storage;
  try {
    const snapshot = await notebookUserSessionQuery(userId, sessionId).once('value');
    if(!snapshot.exists()) { logger.info(`No Notebook User-Session to clean up for User (${userId}) and Session (${sessionId}).`); return/*nothing more to do*/; }
    notebookCollaborations = snapshot.val() as NotebookCollaboration_Storage;
    logger.info(`Found ${Object.keys(notebookCollaborations).length} Notebook User-Session(s) to clean up for User (${userId}) and Session (${sessionId}).`);
  } catch(error) {
    // CHECK: should this throw so that it causes the scheduled function to re-try?
    logger.error(`Could not query expired Notebook User-Sessions for User (${userId}) and Session (${sessionId}). Reason: `, error);
    return/*nothing more to do*/;
  }

  // mark all entries as deleted
  const deletedEntries: Record<string/*notebook-user-session key*/, typeof DeleteRecord> = {};
  for(const notebookId in notebookCollaborations) {
    deletedEntries[relativeNotebookUserSessionKey(notebookId, userId, sessionId)] = DeleteRecord;
  }

  // simply update the parent record with the deleted entries
  try {
    logger.debug(`Writing updated expired Notebook User-Sessions for User (${userId}) and Session (${sessionId}): ${JSON.stringify(deletedEntries)}`);
    await notebooksRef.update(deletedEntries);
  } catch(error) {
    // CHECK: should this throw so that it causes the scheduled function to re-try?
    logger.error(`Error updating expired Notebook User-Sessions for User (${userId}) and Session (${sessionId}). Reason: `, error);
  }
};

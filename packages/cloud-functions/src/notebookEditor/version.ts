import { Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { NotebookIdentifier } from '@ureeka-notebook/service-common';

import { lastVersionQuery } from './datastore';

// ********************************************************************************
// ================================================================================
// returns the last known Version using the specified Transaction. If there are no
// existing Versions then `undefined`
export const getLastVersion = async (transaction: Transaction, notebookId: NotebookIdentifier) => {
  const snapshot = await transaction.get(lastVersionQuery(notebookId));
  if(snapshot.empty) return undefined/*by contract*/;

  if(snapshot.size > 1) logger.warn(`Expected a single last Version but received ${snapshot.size}. Ignoring all but first.`);
  return snapshot.docs[0/*only one by contract*/].data();
};

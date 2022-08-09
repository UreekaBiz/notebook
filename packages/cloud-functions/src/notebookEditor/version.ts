import { Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { NotebookIdentifier, NotebookVersion_Storage } from '@ureeka-notebook/service-common';

import { getSnapshot } from '../util/firestore';
import { lastVersionQuery } from './datastore';

// ********************************************************************************
// == Get =========================================================================
// returns the last known Version using the specified Transaction
export const getLastVersion = async (transaction: Transaction | undefined/*outside transaction*/, notebookId: NotebookIdentifier): Promise<NotebookVersion_Storage | undefined/*no Versions*/> => {
  const snapshot = await getSnapshot(transaction, lastVersionQuery(notebookId));
  if(snapshot.empty) return undefined/*by contract*/;

  if(snapshot.size > 1) logger.warn(`Expected a single last Version but received ${snapshot.size}. Ignoring all but first.`);
  return snapshot.docs[0/*only one by contract*/].data();
};

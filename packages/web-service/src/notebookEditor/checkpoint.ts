import { getDocs } from 'firebase/firestore';

import { Checkpoint_Storage, NotebookIdentifier } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { lastCheckpointQuery } from './datastore';

const log = getLogger(ServiceLogger.NOTEBOOK_EDITOR);

// ********************************************************************************
// SEE: @ureeka-notebook/cloud-functions: notebookEditor/checkpoint.ts
export const getLastCheckpoint = async (notebookId: NotebookIdentifier): Promise<Checkpoint_Storage | undefined/*none*/> => {
  const snapshot = await getDocs(lastCheckpointQuery(notebookId));
  if(snapshot.empty) return undefined/*by contract*/;

  if(snapshot.size > 1) log.warn(`Expected a single last Checkpoint for Notebook (${notebookId}) but received ${snapshot.size}. Ignoring all but first.`);
  return snapshot.docs[0/*only one by contract*/].data();
};

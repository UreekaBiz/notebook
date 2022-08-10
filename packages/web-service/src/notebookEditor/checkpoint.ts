import { getDocs } from 'firebase/firestore';

import { NotebookIdentifier } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { lastCheckpointQuery } from './datastore';

const log = getLogger(ServiceLogger.NOTEBOOK_EDITOR);

// ********************************************************************************
export const getLastCheckpoint = async (notebookId: NotebookIdentifier) => {
  const snapshot = await getDocs(lastCheckpointQuery(notebookId));
  if(snapshot.empty) return undefined/*by contract*/;

  if(snapshot.size > 1) log.warn(`Expected a single last Checkpoint for Notebook (${notebookId}) but received ${snapshot.size}. Ignoring all but first.`);
  return snapshot.docs[0/*only one by contract*/].data();
};

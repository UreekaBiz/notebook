import { Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { getLastCheckpointIndex, generateCheckpointIdentifier, Checkpoint_Storage, Checkpoint_Write, NotebookIdentifier, SystemUserId, NO_NOTEBOOK_VERSION, nodeToContent } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { getEnv } from '../util/environment';
import { getSnapshot, ServerTimestamp } from '../util/firestore';
import { notebookDocument } from '../notebook/datastore';
import { updateNotebookRename } from '../notebook/notebook';
import { getDocumentAtVersion } from './document';
import { checkpointDocument, lastCheckpointQuery } from './datastore';

// ********************************************************************************
const N_VERSIONS = Math.max(0, Number(getEnv('NOTEBOOK_CHECKPOINT_N_VERSIONS', '100'/*guess (balance between # of Checkpoints and # of NotebookVersions clients need to read*/)));

// == Get =========================================================================
// returns the last known Checkpoint using the specified Transaction
// SEE: @ureeka-notebook/web-service: notebookEditor/checkpoint.ts
export const getLastCheckpoint = async (transaction: Transaction | undefined/*outside transaction*/, notebookId: NotebookIdentifier): Promise<Checkpoint_Storage | undefined/*none*/> => {
  const snapshot = await getSnapshot(transaction, lastCheckpointQuery(notebookId));
  if(snapshot.empty) return undefined/*by contract*/;

  if(snapshot.size > 1) logger.warn(`Expected a single last Checkpoint but received ${snapshot.size}. Ignoring all but first.`);
  return snapshot.docs[0/*only one by contract*/].data();
};

// == Create ======================================================================
// creates a new Checkpoint after 'n' NotebookVersions for the specified Notebook
// given the specified NotebookVersion#index
// NOTE: if this fails for any reason (e.g. contention in the transaction, timeout,
//       etc) then it is assumed that a later call will 'catch-up'. Specifically,
//       it is failure tolerant since the worst-case scenario is that the Client
//       simply needs to read more NotebookVersions until the next checkpoint is
//       created.
export const createCheckpoint = async (notebookId: NotebookIdentifier, index: number) => {
  // limit the how often Checkpoints are to be created so that a read is not
  // performed for each NotebookVersion (simply to reduce cost)
//logger.log(`NotebookId: ${notebookId}; index: ${index}; n: ${N_VERSIONS}; index%n: ${index % N_VERSIONS}`);
  if((index <= NO_NOTEBOOK_VERSION/*don't write on initial NotebookVersion*/) || (index % N_VERSIONS !== 0/*remainder*/)) return/*NotebookVersion#index not divisible by 'n'*/;

  // NOTE: it's theoretically possible for r*n and s*n (r<s) to run out-of-order
  //       from each other (i.e. it's possible for 's' to get stored before
  //       'r's Checkpoint gets written). As long as #collapseNotebookVersions() results
  //       in the same content irrespective if it's generated from all NotebookVersions
  //       or NotebookVersions + previous Checkpoint then this is correct.
  await firestore.runTransaction(async transaction => {
    const lastCheckpoint = await getLastCheckpoint(transaction, notebookId),
          lastCheckpointIndex = getLastCheckpointIndex(lastCheckpoint);
//logger.log(`LastCheckpoint: ${JSON.stringify(lastCheckpoint)}; index: ${index}; lastCheckpointIndex: ${lastCheckpointIndex}; index: ${typeof(index)}; n: ${typeof(N_VERSIONS)}; last: ${typeof(lastCheckpointIndex)}; check: ${index < lastCheckpointIndex + N_VERSIONS}`);
    if(index < lastCheckpointIndex + N_VERSIONS) return/*not time yet to make create a Checkpoint*/;

    // ensure that the Notebook document still exists (i.e. has not been deleted either
    // hard or soft) before creating the associated Checkpoint
    const notebookRef = notebookDocument(notebookId);
    const snapshot = await transaction.get(notebookRef);
    if(!snapshot.exists) { logger.info(`Notebook (${notebookId}) no longer exists? Deleted? Checkpoint will not be written.`); return/*nothing more to do*/; }
    const notebook = snapshot.data()!;
    if(notebook.deleted) { logger.info(`Notebook (${notebookId}) soft-deleted. Checkpoint will not be written.`); return/*nothing more to do*/; }

    const document = await getDocumentAtVersion(transaction, notebook.schemaVersion, notebookId, index),
          content = nodeToContent(document);
//logger.log(`Content: ${content}`);

    // *create* (not 'set') the Checkpoint so that duplicate events do not clobber
    // each other
    const checkpointRef = checkpointDocument(notebookId, generateCheckpointIdentifier(index));
    const checkpoint: Checkpoint_Write = {
      schemaVersion: notebook.schemaVersion/*CHECK: this is an obvious candidate but may also be based on 'content'?*/,

      index,
      content,

      createdBy: SystemUserId,
      createTimestamp: ServerTimestamp/*server-set timestamp*/,
    };
    transaction.create(checkpointRef, checkpoint)/*by contract*/;

    // also extract the dependent Notebook meta-data and update the Notebook as needed
    updateNotebookRename(transaction, notebookId, notebook.schemaVersion, content);
  });
};

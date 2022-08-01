import { Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { collapseVersions, generateCheckpointIdentifier, Checkpoint, Checkpoint_Write, NotebookDocumentContent, NotebookIdentifier, NotebookSchemaVersion, SystemUserId, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { getEnv } from '../util/environment';
import { ServerTimestamp } from '../util/firestore';
import { notebookDocument } from '../notebook/datastore';
import { updateExistingNotebook } from '../notebook/notebook';
import { checkpointDocument, lastCheckpointQuery, versionRangeQuery } from './datastore';

// ********************************************************************************
const N_VERSIONS = Math.max(0, Number(getEnv('NOTEBOOK_CHECKPOINT_N_VERSIONS', '100'/*guess (balance between # of Checkpoints and # of NotebookVersions clients need to read*/)));

// ================================================================================
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

    const content = await getNotebookContent(transaction, notebook.schemaVersion, notebookId, index);
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
    updateExistingNotebook(transaction, notebookId, notebook.schemaVersion, content);
  });
};

// ................................................................................
// returns the content of a Notebook at the given index
export const getNotebookContent = async (
  transaction: Transaction,
  version: NotebookSchemaVersion, notebookId: NotebookIdentifier, index: number
): Promise<NotebookDocumentContent> => {
  const lastCheckpoint = await getLastCheckpoint(transaction, notebookId),
        lastCheckpointIndex = getLastCheckpointIndex(lastCheckpoint);

  // (within the Transaction) get the NotebookVersions between the last Checkpoint
  // (exclusive) and the current index (inclusive)
  const versionSnapshot = await transaction.get(versionRangeQuery(notebookId, lastCheckpointIndex/*exclusive*/, index/*inclusive*/));
//logger.log(`NotebookVersions: ${versionSnapshot.size}`);
  const versions = versionSnapshot.docs.map(doc => doc.data());

  return collapseVersions(version, lastCheckpoint, versions);
};

// ................................................................................
// returns the last known Checkpoint using the specified Transaction. If there
// are no existing Checkpoints then `undefined`
export const getLastCheckpoint = async (transaction: Transaction, notebookId: NotebookIdentifier) => {
  const snapshot = await transaction.get(lastCheckpointQuery(notebookId));
  if(snapshot.empty) return undefined/*by contract*/;

  if(snapshot.size > 1) logger.warn(`Expected a single last Checkpoint but received ${snapshot.size}. Ignoring all but first.`);
  return snapshot.docs[0/*only one by contract*/].data();
};
export const getLastCheckpointIndex = (checkpoint: Checkpoint | undefined/*none*/) => (checkpoint === undefined) ? NO_NOTEBOOK_VERSION/*by contract*/ : checkpoint.index;

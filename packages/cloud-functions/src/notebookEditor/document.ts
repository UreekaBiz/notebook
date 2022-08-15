import { Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { collapseVersions, getDocumentFromDocAndVersions, getLastCheckpointIndex, Checkpoint, DocumentNodeType, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { getSnapshot } from '../util/firestore';
import { getLastCheckpoint } from './checkpoint';
import { versionRangeQuery } from './datastore';
import { getVersionsFromIndex } from './version';

// ********************************************************************************
// -- At Version ------------------------------------------------------------------
// returns a ProseMirror Document from a Notebook at the given Version index
export const getDocumentAtVersion = async (
  transaction: Transaction | undefined/*outside transaction*/,
  version: NotebookSchemaVersion, notebookId: NotebookIdentifier, index: number
): Promise<DocumentNodeType> => {
  const lastCheckpoint = await getLastCheckpoint(transaction, notebookId),
        lastCheckpointIndex = getLastCheckpointIndex(lastCheckpoint);

  // (within the Transaction) get the NotebookVersions between the last Checkpoint
  // (exclusive) and the current index (inclusive)
  const versionSnapshot = await getSnapshot(transaction, versionRangeQuery(notebookId, lastCheckpointIndex/*exclusive*/, index/*inclusive*/));
//logger.log(`NotebookVersions: ${versionSnapshot.size}`);
  const versions = versionSnapshot.docs.map(doc => doc.data());

  return collapseVersions(version, lastCheckpoint, versions);
};

// -- Latest ----------------------------------------------------------------------
// SEE: @ureeka-notebook/web-service: notebookEditor/document.ts
export const getLatestDocument = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier,
  schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier
): Promise<{ latestIndex: number; document: DocumentNodeType; }> => {
  // get the latest Checkpoint (if there is one)
  let checkpoint: Checkpoint | undefined/*no Checkpoint generated yet*/;
  try {
    checkpoint = await getLastCheckpoint(transaction, notebookId);
  } catch(error) {
    logger.warn(`Unexpected error reading Checkpoint for Notebook (${notebookId}) for User (${userId}).`, error);
    throw error/*rethrow*/;
  }
  const checkpointIndex = getLastCheckpointIndex(checkpoint);
  logger.debug(`${(checkpointIndex > NO_NOTEBOOK_VERSION) ? `Loaded Checkpoint at Version ${checkpointIndex}` : 'No Checkpoint'} for Notebook (${notebookId}) for User (${userId}).`);

  // get the latest NotebookVersions starting from the last Checkpoint
  let versions: NotebookVersion[];
  try {
    versions = await getVersionsFromIndex(transaction, notebookId, checkpointIndex);
  } catch(error) {
    logger.warn(`Unexpected error reading latest Notebook Versions for Notebook (${notebookId}) for User (${userId}).`, error);
    throw error/*rethrow*/;
  }

  // collapse the received NotebookVersions and the Checkpoint
  const document = collapseVersions(schemaVersion, checkpoint, versions);

  // if there are no NotebookVersions then the Checkpoint represents the last
  // version. If there are NotebookVersions (which must be in order by contract)
  // then the last one is the latest version
  const latestIndex = (versions.length < 1) ? checkpointIndex : versions[versions.length - 1].index;

  return { latestIndex, document };
};

// ................................................................................
export const getOrUpdateToLatestDocument = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier,
  schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier,
  existingDocument?: { versionIndex: number; document: DocumentNodeType; }
): Promise<{ latestIndex: number; doc: DocumentNodeType; }> => {
  if(existingDocument) { /*has an existing Document -- fill in the gap*/
    const { versionIndex, document } = existingDocument;
    const versions = await getVersionsFromIndex(transaction, notebookId, versionIndex);
    const newDocument = getDocumentFromDocAndVersions(schemaVersion, document, versions);
    return { latestIndex: versionIndex, doc: newDocument };
  } else { /*didn't already retrieve the Document -- get whole Document*/
    const { latestIndex, document } = await getLatestDocument(transaction, userId, schemaVersion, notebookId)/*throws on error*/;
    return { latestIndex, doc: document };
  }
};

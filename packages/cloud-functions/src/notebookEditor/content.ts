import { Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { collapseVersions, getLastCheckpointIndex, Checkpoint, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion, JSONContent, UserIdentifier, NO_NOTEBOOK_VERSION, NotebookDocumentContent } from '@ureeka-notebook/service-common';

import { getSnapshot } from '../util/firestore';
import { getLastCheckpoint } from './checkpoint';
import { versionRangeQuery } from './datastore';
import { getVersionsFromIndex } from './version';

// ********************************************************************************
// -- At Version ------------------------------------------------------------------
// returns the content of a Notebook at the given Version index
export const getContentAtVersion = async (
  transaction: Transaction | undefined/*outside transaction*/,
  version: NotebookSchemaVersion, notebookId: NotebookIdentifier, index: number
): Promise<NotebookDocumentContent> => {
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
// SEE: @ureeka-notebook/web-service: notebookEditor/content.ts
export const getLatestContent = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier,
  schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier
): Promise<{ latestIndex: number; jsonContent: JSONContent; }> => {
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
  const content = collapseVersions(schemaVersion, checkpoint, versions);
  const jsonContent = JSON.parse(content)/*FIXME: jsonToContent()?*//*FIXME: handle exceptions!!!*/;

  // if there are no NotebookVersions then the Checkpoint represents the last
  // version. If there are NotebookVersions (which must be in order by contract)
  // then the last one is the latest version
  const latestIndex = (versions.length < 1) ? checkpointIndex : versions[versions.length - 1].index;

  return { latestIndex, jsonContent };
};

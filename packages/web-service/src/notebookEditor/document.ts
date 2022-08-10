import { collapseVersions, getLastCheckpointIndex, Checkpoint, DocumentNodeType, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { getLastCheckpoint } from './checkpoint';
import { getVersionsFromIndex } from './version';

const log = getLogger(ServiceLogger.NOTEBOOK_EDITOR);

// ********************************************************************************
// SEE: @ureeka-notebook/cloud-functions: notebookEditor/document.ts
export const getLatestDocument = async (userId: UserIdentifier, schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier): Promise<{ latestIndex: number; document: DocumentNodeType; }> => {
  // get the latest Checkpoint (if there is one)
  let checkpoint: Checkpoint | undefined/*no Checkpoint generated yet*/;
  try {
    checkpoint = await getLastCheckpoint(notebookId);
  } catch(error) {
    log.warn(`Unexpected error reading Checkpoint for Notebook (${notebookId}) for User (${userId}).`, error);
    throw error/*rethrow*/;
  }
  const checkpointIndex = getLastCheckpointIndex(checkpoint);
  log.debug(`${(checkpointIndex > NO_NOTEBOOK_VERSION) ? `Loaded Checkpoint at Version ${checkpointIndex}` : 'No Checkpoint'} for Notebook (${notebookId}) for User (${userId}).`);

  // get the latest NotebookVersions starting from the last Checkpoint
  let versions: NotebookVersion[];
  try {
    versions = await getVersionsFromIndex(notebookId, checkpointIndex);
  } catch(error) {
    log.warn(`Unexpected error reading latest Notebook (${schemaVersion}) Versions for Notebook (${notebookId}) for User (${userId}).`, error);
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

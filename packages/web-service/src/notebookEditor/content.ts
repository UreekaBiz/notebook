import { collapseVersions, Checkpoint, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion, JSONContent, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { getLastCheckpoint, getLastCheckpointIndex } from './checkpoint';
import { getVersionsFromIndex } from './version';

const log = getLogger(ServiceLogger.NOTEBOOK_EDITOR);

// ********************************************************************************
export const getLatestContent = async (userId: UserIdentifier, schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier): Promise<{ latestIndex: number; jsonContent: JSONContent; }> => {
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
    log.warn(`Unexpected error reading latest Notebook Versions for Notebook (${notebookId}) for User (${userId}).`, error);
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

import { Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { collapseVersions, getDocumentFromDocAndVersions, getLastCheckpointIndex, Checkpoint, DocumentNodeType, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { getSnapshot } from '../util/firestore';
import { getLastCheckpoint } from './checkpoint';
import { versionRangeQuery } from './datastore';
import { getVersionsFromIndex } from './version';

// ********************************************************************************
// convenience structure for working with a specific Version of a Notebook
export type NotebookDocument = Readonly<{
  /** the {@link NotebookSchemaVersion} of the {@link Notebook} */
  schemaVersion: NotebookSchemaVersion;
  /** the {@link NotebookIdentifier} of the {@link Notebook} */
  notebookId: NotebookIdentifier;

  /** the last known Version of the {@link Notebook}. Zero if a new Notebook that
   *  has never been written to. Greater than zero if the Notebook has been written
   *  to. */
  versionIndex: number;

  /** the ProseMirror Document at the corresponding Version index */
  document: DocumentNodeType;
}>;

// == Get =========================================================================
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
export const getOrUpdateToLatestDocument = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier,
  schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier,
  existingNotebookDocument?: NotebookDocument
): Promise<NotebookDocument> => {
  if(existingNotebookDocument) { /*has an existing Document -- fill in the gap*/
    const { versionIndex, document } = existingNotebookDocument/*for convenience*/;
    const versions = await getVersionsFromIndex(transaction, notebookId, versionIndex);
    const newDocument = getDocumentFromDocAndVersions(schemaVersion, document, versions);
    return { schemaVersion, notebookId, versionIndex, document: newDocument };
  } else { /*didn't already retrieve the Document -- get whole Document*/
    return await getLatestDocument(transaction, userId, schemaVersion, notebookId)/*throws on error*/;
  }
};

// ................................................................................
// SEE: @ureeka-notebook/web-service: notebookEditor/document.ts
const getLatestDocument = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier,
  schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier
): Promise<NotebookDocument> => {
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
  const versionIndex = (versions.length < 1) ? checkpointIndex : versions[versions.length - 1].index;

  return { schemaVersion, notebookId, versionIndex, document };
};

// ................................................................................
// convenience wrapper around #getDocumentFromDocAndVersions()
export const getUpdatedDocument = async (notebookDocument: NotebookDocument, versions: NotebookVersion[]): Promise<NotebookDocument> => {
  const newDocument = getDocumentFromDocAndVersions(notebookDocument.schemaVersion, notebookDocument.document, versions),
        versionIndex = (versions.length < 1)
                          ? notebookDocument.versionIndex/*no new Versions so Notebook Document is latest*/
                          : versions[versions.length - 1].index/*since in order by contract, must be last*/;
  return { ...notebookDocument, versionIndex, document: newDocument };
};

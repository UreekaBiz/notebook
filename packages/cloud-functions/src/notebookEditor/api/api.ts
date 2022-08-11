import { createEditorState, generateClientIdentifier, generateUuid, sleep, DocumentNodeType, NotebookIdentifier, NotebookSchemaVersion, ShareRole, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../../firebase';
import { getNotebook } from '../../notebook/notebook';
import { ApplicationError } from '../../util/error';
import { getLatestDocument } from '../document';
import { writeVersions } from '../version';
import { DocumentUpdate } from './type';

// the API for server-side retrieving and modifying Notebooks
// ********************************************************************************
type CollaborationDelay = Readonly<{
  /** time in millis to delay before reading. No delay if <= 0 */
  readDelayMs: number;
  /** time in millis to delay before writing. No delay if <= 0 */
  writeDelayMs: number;
}>;
const collaborationDelay: CollaborationDelay = { readDelayMs: 2000, writeDelayMs: 2000 }/*FIXME: make configurable*/;

// ********************************************************************************
// == Get =========================================================================
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
export const getDocument = async (userId: UserIdentifier, notebookId: NotebookIdentifier): Promise<NotebookDocument> => {
  try {
    // NOTE: retrieved in a transaction to ensure that the schema, version and
    //       document are all mutually consistent
    return firestore.runTransaction(async transaction => {
      const notebook = await getNotebook(transaction, userId, notebookId, ShareRole.Viewer, `retrieve`)/*throws on error*/;
      const { latestIndex, document } = await getLatestDocument(transaction, userId, notebook.schemaVersion, notebookId)/*throws on error*/;

      return {
        schemaVersion: notebook.schemaVersion,
        notebookId,
        versionIndex: latestIndex,
        document,
      };
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/read', `Error retrieving the Document for Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }
};

// == Update ======================================================================
export type UpdateDocumentOptions = Readonly<{
  /** the required {@link NotebookSchemaVersion} of the {@link Notebook}. If not
   *  specified then the write will be allowed regardless of the Schema Version */
  schemaVersion?: NotebookSchemaVersion;

  /** the Version must be this version in order for it to be updated. If not specified
   *  then the write will be allowed regardless of the Version */
  versionIndex?: number;
}>;
export const updateDocument = async (userId: UserIdentifier, notebookId: NotebookIdentifier, updates: DocumentUpdate[], options?: UpdateDocumentOptions): Promise<void> => {
  if(updates.length < 1) return/*nothing to do*/;

  // the client identifier is based on the calling User
  // TODO: think about if it should be based on the System User
  const clientId = generateClientIdentifier({ userId, sessionId: generateUuid()/*unique for this 'session'*/ });

  try {
    // TODO: wrap in bounded retry IFF 'functions/already-exists' is thrown
    //       (and IFF a specific Version index was *not* specified)
    await firestore.runTransaction(async transaction => {
      // get the Notebook and latest Document ensuring they match the User's requests
      if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.readDelayMs);
      const notebook = await getNotebook(transaction, userId, notebookId, ShareRole.Editor/*by definition*/, `update`)/*throws on error*/;
      const schemaVersion = notebook.schemaVersion/*for convenience*/;
      if(options?.schemaVersion && schemaVersion !== options.schemaVersion) throw new ApplicationError('functions/aborted', `Notebook (${notebookId}) Schema Version does not match requested version (${schemaVersion} !== ${options?.schemaVersion}) for User (${userId}).`);
      const { latestIndex, document } = await getLatestDocument(transaction, userId, schemaVersion, notebookId)/*throws on error*/;
      if(options?.versionIndex && latestIndex !== options.versionIndex) throw new ApplicationError('functions/aborted', `Notebook (${notebookId}) Version does not match requested version (${latestIndex} !== ${options?.versionIndex}) for User (${userId}).`);

      // execute the updates against the EditorState
      let editorState = createEditorState(schemaVersion, document);

      // starts a new transaction that will be transformed by all the updates.
      // NOTE: this transaction must maintain the reference between calls to
      //       the DocumentUpdate functions so the steps and the resulting
      //       value is preserved.
      const tr = editorState.tr/*`get` method that creates new transaction*/;
      updates.forEach(update => {
        // creates an editor state based on the initial state applying the
        // transaction up until this point. This is needed to do this way to
        // preserve the reference to the transaction while still having access to
        // the up to date state.
        const currentState = editorState.apply(tr);
        update.update(currentState, tr);
      });

      // write the Versions from the Steps generated from the Document Updates
      if(collaborationDelay.writeDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
      await writeVersions(
        transaction,
        userId, clientId,
        schemaVersion, notebookId,
        latestIndex + 1/*next Version*/, tr.steps
      );
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/read', `Error updating the Document for Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }
};

// == Delete ======================================================================
// CHECK: should this be allowed from the API? If so then perhaps a 'drive' API is
//        also necessary?

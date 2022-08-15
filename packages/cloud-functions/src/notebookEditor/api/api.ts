import { logger } from 'firebase-functions';
import * as collab from 'prosemirror-collab';
import { EditorState } from 'prosemirror-state';
import { Step as ProseMirrorStep } from 'prosemirror-transform';

import { generateClientIdentifier, generateUuid, getSchema, sleep, DocumentNodeType, NotebookIdentifier, NotebookSchemaVersion, ShareRole, UserIdentifier, contentToJSONStep } from '@ureeka-notebook/service-common';

import { getEnv } from '../../util/environment';
import { firestore } from '../../firebase';
import { getNotebook } from '../../notebook/notebook';
import { ApplicationError } from '../../util/error';
import { getLatestDocument } from '../document';
import { getVersionsFromIndex, writeVersions } from '../version';
import { DocumentUpdate } from './type';

// the API for server-side retrieving and modifying Notebooks
// ********************************************************************************
type CollaborationDelay = Readonly<{
  /** time in millis to delay before reading. No delay if <= 0 */
  readDelayMs: number;
  /** time in millis to delay before writing. No delay if <= 0 */
  writeDelayMs: number;
}>;
const collaborationDelay: CollaborationDelay = { readDelayMs: 5000, writeDelayMs: 5000 }/*FIXME: make configurable*/;

// --------------------------------------------------------------------------------
const MAX_RETRIES = Math.max(1, Number(getEnv('NOTEBOOK_UPDATE_DOCUMENT_MAX_ATTEMPTS', '5'/*T&E*/)));

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
      const schemaVersion = notebook.schemaVersion/*for convenience*/,
            schema = getSchema(schemaVersion);
      if(options?.schemaVersion && schemaVersion !== options.schemaVersion) throw new ApplicationError('functions/aborted', `Notebook (${notebookId}) Schema Version does not match requested version (${schemaVersion} !== ${options?.schemaVersion}) for User (${userId}).`);
      const { latestIndex, document: doc } = await getLatestDocument(transaction, userId, schemaVersion, notebookId)/*throws on error*/;
      if(options?.versionIndex && latestIndex !== options.versionIndex) throw new ApplicationError('functions/aborted', `Notebook (${notebookId}) Version does not match requested version (${latestIndex} !== ${options?.versionIndex}) for User (${userId}).`);
      logger.debug(`Read latest Version (${latestIndex}) for Notebook (${notebookId}) for User (${userId})`);

      // establish an Editor State associated with Collaboration for the Document
      let editorState = EditorState.create({ schema, doc, plugins: [collab.collab({ clientID: clientId, version: latestIndex })] });

      // execute the updates against the Editor State
      // NOTE: the collab plugin maintains the set of Steps that have been applied
      updates.forEach(update => {
        // each update is in a separate Transaction which is then applied to update
        // the Editor State
        const tr = editorState.tr/*creates new transaction from the Editor State*/;
          update.update(editorState, tr);
        editorState = editorState.apply(tr);
      });

      // write the Versions from the Steps generated from the updates
      for(let i=0; i<MAX_RETRIES; i++) {
        const sendableStep = collab.sendableSteps(editorState);
        if(!sendableStep || sendableStep.steps.length < 1) { logger.warn(`Expected ProseMirror Steps but found none for Notebook (${notebookId}).`); return/*nothing to do*/; }

        // NOTE: doesn't batch-write Steps since all-or-nothing (by contract)
        if(collaborationDelay.writeDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
        const result = await writeVersions(transaction, userId, clientId, schemaVersion, notebookId, latestIndex + 1/*next Version*/, sendableStep.steps);
        if(result === true) {
          logger.debug(`Wrote Notebook Versions from ${latestIndex + 1} to ${latestIndex + sendableStep.steps.length} for Notebook (${notebookId}).`);
          return/*Steps written successfully so done*/;
        } /* else -- newer Versions exist */

        // there were newer Versions so read, rebase and retry
        logger.debug(`Could not write Notebook Versions starting at index ${latestIndex + 1} for Notebook (${notebookId}). Must read and try again.`);
        const versions = await getVersionsFromIndex(transaction, notebookId, latestIndex);
        const clientIds = versions.map(({ clientId }) => clientId);
        const proseMirrorSteps = versions.map(({ content }) => ProseMirrorStep.fromJSON(schema, contentToJSONStep(content)));
        collab.receiveTransaction(editorState, proseMirrorSteps, clientIds, { mapSelectionBackward: true });
      }
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/read', `Error updating the Document for Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }
};

// == Delete ======================================================================
// CHECK: should this be allowed from the API? If so then perhaps a 'drive' API is
//        also necessary?

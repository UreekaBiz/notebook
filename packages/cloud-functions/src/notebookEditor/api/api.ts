import { generateClientIdentifier, generateUuid, sleep, NotebookIdentifier, NotebookSchemaVersion, ShareRole, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../../firebase';
import { getNotebook } from '../../notebook/notebook';
import { ApplicationError } from '../../util/error';
import { getOrUpdateToLatestDocument, NotebookDocument } from '../document';
import { writeVersionsFromDocumentUpdates } from '../version';
import { DocumentUpdate } from './type';

// the API for server-side retrieving and modifying Notebooks
// ********************************************************************************
type CollaborationDelay = Readonly<{
  /** time in millis to delay before reading. No delay if <= 0 */
  readDelayMs: number;
  /** time in millis to delay before writing. No delay if <= 0 */
  writeDelayMs: number;
}>;
export const collaborationDelay: CollaborationDelay = { readDelayMs: 5000, writeDelayMs: 5000 }/*FIXME: make configurable*/;

// ********************************************************************************
export type UpdateDocumentOptions = Readonly<{
  /** the required {@link NotebookSchemaVersion} of the {@link Notebook}. If not
   *  specified then the write will be allowed regardless of the Schema Version */
  schemaVersion?: NotebookSchemaVersion;

  /** the Version must be this version in order for it to be updated. If not specified
   *  then the write will be allowed regardless of the Version */
  versionIndex?: number;
}>;

// ================================================================================
export class EditorApi {
  // cache any retrieved Document for each Notebook
  private readonly documentCache = new Map<NotebookIdentifier, NotebookDocument>();

  // == Get =======================================================================
  public async getDocument(userId: UserIdentifier, notebookId: NotebookIdentifier): Promise<NotebookDocument> {
    // NOTE: can't just return what's in the cache since it may be out of date

    try {
      // NOTE: retrieved in a transaction to ensure that the Schema, version and
      //       Document are all mutually consistent
      const notebookDocument = await firestore.runTransaction(async transaction => {
        // ensure that the User has access to the Notebook
        if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.readDelayMs);
        const notebook = await getNotebook(transaction, userId, notebookId, ShareRole.Viewer, `retrieve`)/*throws on error*/;
        const schemaVersion = notebook.schemaVersion/*for convenience*/;

        return await getOrUpdateToLatestDocument(transaction, userId, schemaVersion, notebookId, this.documentCache.get(notebookId))/*throws on error*/;
      });

      // update the cache with the latest Document (since it may have been updated)
      this.documentCache.set(notebookId, notebookDocument);
      return notebookDocument;
    } catch(error) {
      if(error instanceof ApplicationError) throw error;
      throw new ApplicationError('datastore/read', `Error retrieving the Document for Notebook (${notebookId}) for User (${userId}). Reason: `, error);
    }
  }

  // == Update ====================================================================
  public async updateDocument(userId: UserIdentifier, notebookId: NotebookIdentifier, updates: DocumentUpdate[], options?: UpdateDocumentOptions): Promise<void> {
    if(updates.length < 1) return/*nothing to do*/;

    // the client identifier is based on the calling User
    // TODO: think about if it should be based on the System User
    const clientId = generateClientIdentifier({ userId, sessionId: generateUuid()/*unique for this 'session'*/ });

    try {
      // by #updateDocument() contract, this is all-or-nothing
      const notebookDocument = await firestore.runTransaction(async transaction => {
        // get the Notebook and ensure that its Schema Version matches the User's request
        if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.readDelayMs);
        const notebook = await getNotebook(transaction, userId, notebookId, ShareRole.Editor/*by definition*/, `update`)/*throws on error*/;
        const schemaVersion = notebook.schemaVersion/*for convenience*/;
        if(options?.schemaVersion && schemaVersion !== options.schemaVersion) throw new ApplicationError('functions/aborted', `Notebook (${notebookId}) Schema Version does not match requested version (${schemaVersion} !== ${options?.schemaVersion}) for User (${userId}).`);

        // get the latest Document
        // NOTE: the check against Options is in this call purely for simplicity
        const notebookDocument = await getOrUpdateToLatestDocument(transaction, userId, schemaVersion, notebookId, this.documentCache.get(notebookId))/*throws on error*/;

        // update the Document (specifically, writes Versions) based on the
        // specified updates
        return await writeVersionsFromDocumentUpdates(transaction, userId, clientId, notebookDocument, updates)/*logs on error*/;
      });

      // update the cache with the latest Document (since it may have been updated)
      this.documentCache.set(notebookId, notebookDocument);
    } catch(error) {
      if(error instanceof ApplicationError) throw error;
      throw new ApplicationError('datastore/read', `Error updating the Document for Notebook (${notebookId}) for User (${userId}). Reason: `, error);
    }
  }

  // == Delete ====================================================================
  // CHECK: should this be allowed from the API? If so then perhaps a 'drive' API is
  //        also necessary?
}

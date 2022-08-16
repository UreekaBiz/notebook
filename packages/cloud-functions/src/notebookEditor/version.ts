import { Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import * as collab from 'prosemirror-collab';
import { EditorState } from 'prosemirror-state';
import { Step as ProseMirrorStep } from 'prosemirror-transform';

import { contentToJSONStep, generateNotebookVersionIdentifier, getSchema, sleep, ClientIdentifier, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion_Storage, NotebookVersion_Write, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { getEnv } from '../util/environment';
import { ApplicationError } from '../util/error';
import { getSnapshot, ServerTimestamp } from '../util/firestore';
import { collaborationDelay, UpdateDocumentOptions } from './api/api';
import { DocumentUpdate } from './api/type';
import { lastVersionQuery, lastVersionsQuery, versionDocument } from './datastore';
import { NotebookDocument, getUpdatedDocument } from './document';

// ********************************************************************************
// --------------------------------------------------------------------------------
const MAX_RETRIES = Math.max(1, Number(getEnv('NOTEBOOK_UPDATE_DOCUMENT_MAX_ATTEMPTS', '5'/*T&E*/)));

// ********************************************************************************
// == Get =========================================================================
// -- Latest ----------------------------------------------------------------------
// returns the last known Version using the specified Transaction
export const getLastVersion = async (transaction: Transaction | undefined/*outside transaction*/, notebookId: NotebookIdentifier): Promise<NotebookVersion_Storage | undefined/*no Versions*/> => {
  const snapshot = await getSnapshot(transaction, lastVersionQuery(notebookId));
  if(snapshot.empty) return undefined/*by contract*/;

  if(snapshot.size > 1) logger.warn(`Expected a single last Version but received ${snapshot.size}. Ignoring all but first.`);
  return snapshot.docs[0/*only one by contract*/].data();
};

// --------------------------------------------------------------------------------
// get NotebookVersions between the specified index and whatever the latest is
export const getVersionsFromIndex = async (transaction: Transaction | undefined/*outside transaction*/, notebookId: NotebookIdentifier, index/*exclusive*/: number): Promise<NotebookVersion_Storage[]> => {
  const snapshot = await getSnapshot(transaction, lastVersionsQuery(notebookId, index));
  return snapshot.docs.map(doc => doc.data());
};

// == Write =======================================================================
// writes the batch of ProseMirror Steps as Notebook Versions
// SEE: @web-service: notebookEditor/version.ts
const writeVersions = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier, clientId: ClientIdentifier,
  schemaVersion: NotebookSchemaVersion,  notebookId: NotebookIdentifier,
  startingIndex: number, pmSteps: ProseMirrorStep[]
): Promise<boolean> => {
  const transactionBody = async (transaction: Transaction): Promise<boolean> => {
    // NOTE: only checks against first Version since if that doesn't exist then no
    //       other Version can exist by definition (since monotonically increasing)
    // NOTE: if other Versions *do* get written as this writes then the Transaction
    //       will be aborted internally by Firestore (by definition). When re-run
    //       then the Version would exist and this returns false.
    const firstVersionId = generateNotebookVersionIdentifier(startingIndex),
          firstVersionRef = versionDocument(notebookId, firstVersionId);
    const snapshot = await transaction.get(firstVersionRef);
// logger.debug(`Trying to write Notebook Versions ${startingIndex} - ${startingIndex + versions.length - 1}`);
    if(snapshot.exists) return false/*abort -- NotebookVersion with startingIndex already exists*/;

    pmSteps.forEach((pmStep, index) => {
      const versionIndex = startingIndex + index;
      const versionId = generateNotebookVersionIdentifier(versionIndex),
            versionDocumentRef = versionDocument(notebookId, versionId);

      const version: NotebookVersion_Write = {
        schemaVersion,

        index: versionIndex,
        clientId,
        content: JSON.stringify(pmStep.toJSON())/*FIXME: refactor into a function*/,

        createdBy: userId,
        createTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.create(versionDocumentRef, version)/*create will throw if already exists (which is desired!)*/;
    });

    return true/*successfully written*/;
  };

  // if a Transaction is provided then use it, otherwise create a new one
  if(transaction) return await transactionBody(transaction);
  else return await firestore.runTransaction(transactionBody);
};

// --------------------------------------------------------------------------------
// writes Versions based on the specified Document Updates retrying if necessary
export const writeVersionsFromDocumentUpdates = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier, clientId: ClientIdentifier,
  notebookDocument: NotebookDocument,
  updates: DocumentUpdate[], options?: UpdateDocumentOptions
): Promise<NotebookDocument> => {
  const { schemaVersion, notebookId } = notebookDocument/*for convenience*/,
        schema = getSchema(schemaVersion);

  // NOTE: this call structure is complicated by the fact that any Document reads
  //       are preserved and returned (simply for efficiency)
  try {
    // ensure the initial Document matches any caller requests
    if(options?.versionIndex && notebookDocument.versionIndex !== options.versionIndex) throw new ApplicationError('functions/aborted', `Notebook (${notebookId}) Version does not match requested version (${notebookDocument.versionIndex} !== ${options?.versionIndex}) for User (${userId}).`);
    logger.debug(`Read latest Version (${notebookDocument.versionIndex}) for Notebook (${notebookId}) for User (${userId})`);

    // establish an Editor State associated with Collaboration for the Document
    let editorState = EditorState.create({ schema, doc: notebookDocument.document, plugins: [collab.collab({ clientID: clientId, version: notebookDocument.versionIndex })] });

    // execute the Updates against the Editor State
    // NOTE: the collab plugin attaches the Steps that have been applied to the
    //       Editor State for later retrieval
    updates.forEach(update => {
      // each update is in a separate Transaction which is then applied to update
      // the Editor State
      const tr = editorState.tr/*creates new transaction from the Editor State*/;
        update.update(editorState, tr);
      editorState = editorState.apply(tr);
    });

    return await writeVersionsFromCollabEditorState(transaction, userId, clientId, editorState, notebookDocument)/*logs on error*/;
  } catch(error) {
    if(!(error instanceof ApplicationError)) logger.error('devel/unhandled', error);
    return notebookDocument/*return whatever was last read*/;
  }
};

// ................................................................................
// using the collab-augmented Editor State, extract the Steps created from the
// Updates and write them as Versions
const writeVersionsFromCollabEditorState = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier, clientId: ClientIdentifier,
  editorState: EditorState,
  notebookDocument: NotebookDocument
): Promise<NotebookDocument> => {
  const { schemaVersion, notebookId } = notebookDocument/*for convenience*/,
        schema = getSchema(schemaVersion);

  // NOTE: this call structure is complicated by the fact that any Document reads
  //       are preserved and returned (so they don't need to be re-read again)
  try {
    // bound the number of tries to prevent runaways in highly concurrent cases
    for(let i=0; i<MAX_RETRIES; i++) {
      // get the ProseMirror Steps that were added as Updates
      const sendableStep = collab.sendableSteps(editorState);
      if(!sendableStep || sendableStep.steps.length < 1) { logger.warn(`Expected ProseMirror Steps but found none for Notebook (${notebookId}).`); return notebookDocument/*nothing to do*/; }

      // attempt to write the Steps as Versions
      // NOTE: doesn't batch-write Steps since all-or-nothing (by contract)
      if(collaborationDelay.writeDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
      const result = await writeVersions(transaction, userId, clientId, schemaVersion, notebookId, notebookDocument.versionIndex + 1/*next Version*/, sendableStep.steps)/*throws on error*/;
      if(result === true) {
        logger.debug(`Wrote Notebook Versions from ${notebookDocument.versionIndex + 1} to ${notebookDocument.versionIndex + sendableStep.steps.length} for Notebook (${notebookId}).`);
        return notebookDocument/*Steps written successfully so done*/;
      } /* else -- newer Versions exist */

      // there were newer Versions so read, rebase and retry
      // NOTE: just like web-service's VersionListener, the source of truth is the
      //       Versions so this does not attempt to add the Steps to the Document.
      //       Steps that are added will get picked up when the latest Document is
      //       read the next time.
      logger.debug(`Could not write Notebook Versions starting at index ${notebookDocument.versionIndex + 1} for Notebook (${notebookId}). Must read and try again.`);
      if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.readDelayMs);
      const versions = await getVersionsFromIndex(transaction, notebookId, notebookDocument.versionIndex);
      if(versions.length < 1) throw new ApplicationError('functions/aborted', `Expected new Versions after failed write but found none for Notebook (${notebookId}).`);
      logger.debug(`Read ${versions.length} new Versions for Notebook (${notebookId}).`);

      const proseMirrorSteps = versions.map(({ content }) => ProseMirrorStep.fromJSON(schema, contentToJSONStep(content)));
      const clientIds = versions.map(({ clientId }) => clientId);
      collab.receiveTransaction(editorState, proseMirrorSteps, clientIds, { mapSelectionBackward: true });

      const previousVersionIndex = notebookDocument.versionIndex;
      notebookDocument = await getUpdatedDocument(notebookDocument, versions);
      logger.debug(`Advancing latest Version to ${notebookDocument.versionIndex} from ${previousVersionIndex} for Notebook (${notebookId}).`);
    }
    // NOTE: retried MAX_RETRIES times without writing
    throw new ApplicationError('functions/aborted', `Unable to write Notebook Updates due to write contention for Notebook (${notebookId}).`);
  } catch(error) {
    if(!(error instanceof ApplicationError)) logger.error('devel/unhandled', error);
    return notebookDocument/*return whatever was last read*/;
  }
};

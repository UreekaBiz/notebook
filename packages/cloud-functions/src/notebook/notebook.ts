import { DocumentReference, Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { contentToNode, extractDocumentName, getSchema, NotebookDocumentContent, NotebookIdentifier, NotebookType, NotebookSchemaVersion, Notebook_Create, Notebook_Delete, Notebook_Storage, Notebook_Update, SystemUserId, UserIdentifier, DEFAULT_NOTEBOOK_NAME } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { notebookCollection, notebookDocument } from './datastore';

// ********************************************************************************
// == Get =========================================================================
// gets the Title of a Document from the specified content
// NOTE: If there is no a valid title on the content from an Checkpoint it will
//       default to 1) the first 'n' characters of the content or 2) DEFAULT_NOTEBOOK_NAME
export const getNotebookName = (notebookId: NotebookIdentifier, version: NotebookSchemaVersion, content: NotebookDocumentContent): string =>  {
  switch(version) {
    case NotebookSchemaVersion.V1: throw new ApplicationError('devel/unhandled', `Notebook schema version '${NotebookSchemaVersion.V1}' is no longer supported.`);
    case NotebookSchemaVersion.V2:
      const document = contentToNode(getSchema(version), content);
      if(!document) { logger.error(`Trying to get Notebook (${version}; ${notebookId}) without valid content.`); return DEFAULT_NOTEBOOK_NAME /*nothing to do*/;}

      return extractDocumentName(document);

    default:
      logger.error(`Unknown Notebook version (${version}) while retrieving name from Notebook (${notebookId}).`);
      return DEFAULT_NOTEBOOK_NAME/*default to default*/;
  }
};

// == Create ======================================================================
export const createNewNotebook = async (
  userId: UserIdentifier,
  type: NotebookType, name: string
): Promise<NotebookIdentifier> => {
  const schemaVersion = NotebookSchemaVersion.V2;
  try {
    const notebookRef = notebookCollection.doc(/*create new*/) as DocumentReference<Notebook_Create>,
          notebookId = notebookRef.id;
    const notebook: Notebook_Create = {
      type,
      schemaVersion,

      viewers: [userId/*creator must be a viewer by contract*/],
      editors: [userId/*creator must be an editor by contract*/],

      name,

      deleted: false/*not deleted by default*/,

      createdBy: userId,
      createTimestamp: ServerTimestamp/*by contract*/,
      lastUpdatedBy: userId,
      updateTimestamp: ServerTimestamp/*by contract*/,
    };
    await notebookRef.create(notebook)/*create by definition*/;

    return notebookId;
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error creating new Notebook (Version ${schemaVersion}) for User (${userId}). Reason: `, error);
  }
};

// == Update ======================================================================
// extracts meta-data (e.g. the Title) from the specified Notebook and updates the
// Notebook document (using the specified Transaction) as needed
// NOTE: currently only run on Checkpoints
export const updateExistingNotebook = (transaction: Transaction, notebookId: NotebookIdentifier, version: NotebookSchemaVersion, content: NotebookDocumentContent) => {
  const name = getNotebookName(notebookId, version, content);

  const notebookRef = notebookDocument(notebookId);
  const notebook: Notebook_Update = {
    name,

    lastUpdatedBy: SystemUserId/*by contract*/,
    updateTimestamp: ServerTimestamp/*server-written*/,
  };
  transaction.update(notebookRef, notebook);
};

// == Delete ======================================================================
export const deleteNotebook = async (userId: UserIdentifier, notebookId: NotebookIdentifier) => {
  try {
    const notebookRef = notebookCollection.doc(notebookId) as DocumentReference<Notebook_Delete>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(notebookRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot delete non-existing Notebook (${notebookId}) for User (${userId}).`);
      const existingNotebook = snapshot.data()! as Notebook_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the user specifically to
      //        be able to check if the User is also an admin
      if(existingNotebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot delete Notebook (${notebookId}) not created by User (${userId}).`);
      if(existingNotebook.deleted) throw new ApplicationError('data/deleted', `Cannot delete already deleted Notebook (${notebookId}) for User (${userId}).`);

      const notebook: Notebook_Delete = {
        deleted: true/*by definition*/,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.set(notebookRef, notebook);
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error deleting Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }
};

import { generateNotebookVersionIdentifier, removeUndefined, NotebookIdentifier, PublishedNotebook_Create, PublishedNotebookIdentifier, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { getNotebookContent } from '../notebookEditor/checkpoint';
import { versionDocument } from '../notebookEditor/datastore';
import { notebookDocument, publishedNotebookDocument } from './datastore';

// ********************************************************************************
// == Create ======================================================================
export const createNewPublishedNotebook = async (
  userId: UserIdentifier,
  notebookId: NotebookIdentifier, version: number,
  title: string, image?: string, snippet?: string,
): Promise<PublishedNotebookIdentifier> => {
  // NOTE: is the same as the notebook that it belongs to
  const publishedNotebookId = notebookId/*alias*/,
        publishedNotebookRef = publishedNotebookDocument(publishedNotebookId);

  try{
    await firestore.runTransaction(async transaction => {
      // ensure that the Notebook document still exists (i.e. has not been deleted
      // either hard or soft) before creating the associated Published Notebook
      const notebookRef = notebookDocument(notebookId);
      const snapshot = await transaction.get(notebookRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot create Published Notebook for non-existing Notebook (${notebookId}) for User (${userId}).`);
      const notebook = snapshot.data()!;
      if(notebook.deleted) throw new ApplicationError('functions/not-found', `Cannot create Published Notebook for soft-deleted Notebook (${notebookId}) for User (${userId}).`);

      // ensure that a valid Version exists for the given version before creating
      // the associated Published Notebook
      const versionId = generateNotebookVersionIdentifier(version),
            versionRef = versionDocument(notebookId, versionId);
      const versionSnapshot = await transaction.get(versionRef);
      if(!versionSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot create Published Notebook for non-existing Version (${version}) in Notebook (${notebookId}) for User (${userId}).`);

      const content = await getNotebookContent(transaction, notebook.schemaVersion, notebookId, version);
      const publishedNotebook: PublishedNotebook_Create = {
        version,

        title,
        image,
        snippet,
        content,

        createdBy: userId,
        createTimestamp: ServerTimestamp/*by contract*/,
        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/
      };
      transaction.set(publishedNotebookRef, removeUndefined(publishedNotebook))/*by contract*/;
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error creating Published Notebook (${notebookId}) at Version (${version}) for User (${userId}). Reason: `, error);
  }

  return publishedNotebookId;
};

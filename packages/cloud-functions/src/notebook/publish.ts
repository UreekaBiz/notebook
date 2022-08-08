import { generateNotebookVersionIdentifier, removeUndefined, Creatable_Create, NotebookIdentifier, NotebookPublished_Update, NotebookPublishedContent_Update, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { getNotebookContent } from '../notebookEditor/checkpoint';
import { versionDocument } from '../notebookEditor/datastore';
import { notebookDocument, notebookPublishedContentDocument, notebookPublishedDocument } from './datastore';
import { updateNotebookPublish } from './notebook';

// Notebook publishing
// ********************************************************************************
// NOTE: this also handles re-publishing an already published Notebook
export const publishNotebook = async (
  userId: UserIdentifier,
  notebookId: NotebookIdentifier, versionIndex: number,
  title: string, image?: string, snippet?: string
): Promise<NotebookIdentifier> => {
  const notebookPublishedRef = notebookPublishedDocument(notebookId),
        notebookPublishedContentRef = notebookPublishedContentDocument(notebookId);
  try {
    await firestore.runTransaction(async transaction => {
      // ensure that the Notebook document still exists (i.e. has not been deleted
      // either hard or soft) and that the caller is the Creator of the Notebook
      const notebookRef = notebookDocument(notebookId);
      const notebookSnapshot = await transaction.get(notebookRef);
      if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot create Published Notebook for non-existing Notebook (${notebookId}) for User (${userId}).`);
      const notebook = notebookSnapshot.data()!;
      if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot create Published Notebook for soft-deleted Notebook (${notebookId}) for User (${userId}).`);
      // TODO: allow editors to publish Notebooks? (Likely need a 'Publisher' role)
      if(notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Only the Author of a Notebook (${notebookId}) may publish it for User (${userId}).`);

      // ensure that a valid Version exists for the given version index
      const versionId = generateNotebookVersionIdentifier(versionIndex),
            versionRef = versionDocument(notebookId, versionId);
      const versionSnapshot = await transaction.get(versionRef);
      if(!versionSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot create Published Notebook for non-existing Version (${versionIndex}) in Notebook (${notebookId}) for User (${userId}).`);

      // if the Notebook isn't already published then update its state
      const isPublished = notebook.isPublished/*preserve state*/;
      if(!isPublished) updateNotebookPublish(transaction, notebookId, true/*by definition*/);

      // if already published then preserve the Creatable fields (by not writing them)
      const create: Creatable_Create<any> | undefined/*already exists*/ =
        isPublished
          ? undefined/*already exists*/
          : { /*doesn't already exist so add Creatable fields*/
              createdBy: userId,
              createTimestamp: ServerTimestamp/*by contract*/,
            };

      const publishedNotebook: NotebookPublished_Update = {
        versionIndex,

        title,
        image,
        snippet,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.set(notebookPublishedRef, removeUndefined({ ...create, ...publishedNotebook }))/*full write, by contract*/;

      const content = await getNotebookContent(transaction, notebook.schemaVersion, notebookId, versionIndex);
      const publishedNotebookContent: NotebookPublishedContent_Update = {
        ...publishedNotebook,
        content,
      };
      transaction.set(notebookPublishedContentRef, removeUndefined({ ...create, ...publishedNotebookContent }))/*full write, by contract*/;
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error publishing Notebook (${notebookId}) at Version (${versionIndex}) for User (${userId}). Reason: `, error);
  }

  return notebookId;
};

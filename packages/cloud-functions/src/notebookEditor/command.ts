import { logger } from 'firebase-functions';

import { generateNotebookVersionIdentifier, getEditorState, getRandomSystemUserId, NotebookIdentifier, NotebookVersion_Write, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { notebookDocument } from '../notebook/datastore';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { getNotebookContent } from './checkpoint';
import { versionDocument } from './datastore';
import { getLastVersion } from './version';

// ********************************************************************************
// == Command =====================================================================
// inserts the specified text at the start of the the specified notebook.
export const insertText = async (
  userId: UserIdentifier,
  notebookId: NotebookIdentifier,
  text: string
): Promise<NotebookIdentifier> => {
  try {
    await firestore.runTransaction(async transaction => {
      // ensure that the Notebook document still exists (i.e. has not been deleted
      // either hard or soft) and that the caller has the right permissions to edit
      // its content.
      const notebookRef = notebookDocument(notebookId);
      const notebookSnapshot = await transaction.get(notebookRef);
      if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot insertText for non-existing Notebook (${notebookId}) for User (${userId}).`);
      const notebook = notebookSnapshot.data()!;
      if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot insertText for soft-deleted Notebook (${notebookId}) for User (${userId}).`);
      if(!notebook.editors.includes(userId) && notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Only Editors of a Notebook (${notebookId}) may perform insertText for User (${userId}).`);

      // gets the last version of the Notebook and gets the reference for the next
      // logical version. If no version exists then the next version is the first
      const lastVersion = await getLastVersion(transaction, notebookId),
            lastVersionIndex = lastVersion?.index;
      const nextVersionIndex = lastVersionIndex ? lastVersionIndex + 1 : NO_NOTEBOOK_VERSION/*start of document if no last version*/,
            nextVersionId = generateNotebookVersionIdentifier(nextVersionIndex),
            nextVersionRef = versionDocument(notebookId, nextVersionId);

      // gets the content at the given version if it exists.
      const notebookContent = lastVersionIndex ? await getNotebookContent(transaction, notebook.schemaVersion, notebookId, lastVersionIndex) : undefined/*no content*/;
      const editorState = getEditorState(notebook.schemaVersion, notebookContent);

      logger.log(editorState);
      logger.log(editorState?.doc.toJSON());
      logger.log(editorState?.schema);

      // Creates a unique identifier for the clientId.
      const clientId = getRandomSystemUserId();

      // FIXME: This is a hardcoded value that inserts the given text at the start
      //        of the notebook, in a real example it will crate a editor and make
      //        the corresponding change that generates the step.
      const pmStep = {
        stepType: 'replace',
        from: 1,
        to: 1,
        slice:{ content:[{ type: 'text', text }] },
      };

      const write: NotebookVersion_Write = {
        schemaVersion: notebook.schemaVersion/*matching Notebook for consistency*/,

        index: nextVersionIndex,
        clientId,
        content: JSON.stringify(pmStep)/*FIXME: refactor into a function*/,

        createdBy: userId,
        createTimestamp: ServerTimestamp/*by contract*/,
      };

      // using create instead of set to ensure that the document is created
      transaction.create(nextVersionRef, write);
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error inserting text for notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }

  return notebookId;
};

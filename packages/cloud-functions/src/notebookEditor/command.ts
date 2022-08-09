import { getEditorState, getRandomSystemUserId, Command, NotebookIdentifier, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { notebookDocument } from '../notebook/datastore';
import { ApplicationError } from '../util/error';
import { getNotebookContent } from './checkpoint';
import { saveEditorStateTransaction } from './transaction';
import { getLastVersion } from './version';

// ********************************************************************************
// FIXME: Both commands are really similar, they only differ in the command that is
//        executed!
// == Command =====================================================================
// inserts multiple numbers at random positions in the Notebook.
export const insertNumbers = async (
  userId: UserIdentifier,
  notebookId: NotebookIdentifier
): Promise<NotebookIdentifier> => {
  try {
    // FIXME: This may not need to be a transaction. saveEditorStateTransaction
    //        creates a new transaction when saving the steps instead of using the
    //        existing transaction to prevent getting the editor content multiple
    //        times. Since both are transactions that can run multiple times the
    //        amount of operations is exponentially larger.
    await firestore.runTransaction(async transaction => {
      // ensure that the Notebook document still exists (i.e. has not been deleted
      // either hard or soft) and that the caller has the right permissions to edit
      // its content.
      const notebookRef = notebookDocument(notebookId);
      const notebookSnapshot = await transaction.get(notebookRef);
      if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot perform command insertNumbers for non-existing Notebook (${notebookId}) for User (${userId}).`);
      const notebook = notebookSnapshot.data()!;
      if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot perform command insertNumbers for soft-deleted Notebook (${notebookId}) for User (${userId}).`);
      if(!notebook.editors.includes(userId) && notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Only Editors of a Notebook (${notebookId}) may perform command insertNumbers for User (${userId}).`);

      // gets the last version of the Notebook and gets the reference for the next
      // logical version. If no version exists then the next version is the first
      const lastVersion = await getLastVersion(transaction, notebookId),
            lastVersionIndex = lastVersion?.index;
      const nextVersionIndex = lastVersionIndex ? lastVersionIndex + 1 : NO_NOTEBOOK_VERSION/*start of document if no last version*/;

      // gets the content at the given version if it exists.
      const notebookContent = lastVersionIndex ? await getNotebookContent(transaction, notebook.schemaVersion, notebookId, lastVersionIndex) : undefined/*no content*/;
      const editorState = getEditorState(notebook.schemaVersion, notebookContent);
      if(!editorState) throw new ApplicationError('data/integrity', `Cannot create editorState for Notebook (${notebookId}) for version (${lastVersion}).`);

      const command: Command = (tr) => {
        // inserts 10 characters at random positions in the document.
        for(let i=0;i<10;i++) {
          const position = Math.floor(Math.random() * tr.doc.content.size) + 1/*start of valid content*/;
          tr.insertText(String(i), position, position);
        }
        return true/*command can be performed*/;
      };

      // Creates a unique identifier for the clientId.
      const clientId = getRandomSystemUserId();
      await saveEditorStateTransaction(
        notebookId,
        notebook.schemaVersion/*matching Notebook for consistency*/,
        userId,
        clientId,
        nextVersionIndex,
        editorState,
        command
      );
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error performing command insertNumbers for notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }

  return notebookId;
};

// inserts the specified text at the start of the the specified notebook.
export const insertText = async (
  userId: UserIdentifier,
  notebookId: NotebookIdentifier,
  text: string
): Promise<NotebookIdentifier> => {
  try {
    // FIXME: This may not need to be a transaction. saveEditorStateTransaction
    //        creates a new transaction when saving the steps instead of using the
    //        existing transaction to prevent getting the editor content multiple
    //        times. Since both are transactions that can run multiple times the
    //        amount of operations is exponentially larger.
    await firestore.runTransaction(async transaction => {
      // ensure that the Notebook document still exists (i.e. has not been deleted
      // either hard or soft) and that the caller has the right permissions to edit
      // its content.
      const notebookRef = notebookDocument(notebookId);
      const notebookSnapshot = await transaction.get(notebookRef);
      if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot perform command insertText for non-existing Notebook (${notebookId}) for User (${userId}).`);
      const notebook = notebookSnapshot.data()!;
      if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot perform command insertText for soft-deleted Notebook (${notebookId}) for User (${userId}).`);
      if(!notebook.editors.includes(userId) && notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Only Editors of a Notebook (${notebookId}) may perform command insertText for User (${userId}).`);

      // gets the last version of the Notebook and gets the reference for the next
      // logical version. If no version exists then the next version is the first
      const lastVersion = await getLastVersion(transaction, notebookId),
            lastVersionIndex = lastVersion?.index;
      const nextVersionIndex = lastVersionIndex ? lastVersionIndex + 1 : NO_NOTEBOOK_VERSION/*start of document if no last version*/;

      // gets the content at the given version if it exists.
      const notebookContent = lastVersionIndex ? await getNotebookContent(transaction, notebook.schemaVersion, notebookId, lastVersionIndex) : undefined/*no content*/;
      const editorState = getEditorState(notebook.schemaVersion, notebookContent);
      if(!editorState) throw new ApplicationError('data/integrity', `Cannot create editorState for Notebook (${notebookId}) for version (${lastVersion}).`);

      const command: Command = (tr) => {
        tr.insertText(text, 1, 1/*start of document*/);
        return true/*command can be performed*/;
      };

      // Creates a unique identifier for the clientId.
      const clientId = getRandomSystemUserId();
      await saveEditorStateTransaction(
        notebookId,
        notebook.schemaVersion/*matching Notebook for consistency*/,
        userId,
        clientId,
        nextVersionIndex,
        editorState,
        command
      );
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error performing command insertText for notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }

  return notebookId;
};

import { DocumentReference } from 'firebase-admin/firestore';

import { LabelIdentifier, LabelVisibility, LabelNotebook_Write, Label_Storage, NotebookIdentifier, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { writeBatch, ServerTimestamp } from '../util/firestore';
import { labelNotebookCollection, labelDocument } from './datastore';

// ********************************************************************************
// == Add =========================================================================
export const addNotebook = async (
  userId: UserIdentifier,
  labelId: LabelIdentifier, notebookId: NotebookIdentifier
) => {
  try {
    const labelRef = labelDocument(labelId) as DocumentReference<Label_Storage>,
          labelNotebookRef = labelNotebookCollection(labelId).doc(notebookId) as DocumentReference<LabelNotebook_Write>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(labelRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot add a Notebook (${notebookId}) to a non-existing Label (${labelId}) for User (${userId}).`);
      const parentLabel = snapshot.data()!;

      const labelNotebook: LabelNotebook_Write = {
        labelId,
        notebookId,

        name: parentLabel.name,
        order: ServerTimestamp,

        createdBy: userId,
        createTimestamp: ServerTimestamp/*by contract*/,
      };
      await labelNotebookRef.set(labelNotebook)/*'set' and not 'create' by contract*/;

      // FIXME: update Notebook's permissions based on the Label's permissions

      if(parentLabel.visibility === LabelVisibility.Public) {
        // FIXME: check if the Notebook is published and if so then also write to the published collection
      } /* else -- the parent Label is private and nothing else needs to be done */
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error adding Notebook (${notebookId}) to Label (${labelId}) for User (${userId}). Reason: `, error);
  }
};

// == Remove ======================================================================
export const removeNotebook = async (
  userId: UserIdentifier,
  labelId: LabelIdentifier, notebookId: NotebookIdentifier
) => {
  try {
    const labelRef = labelDocument(labelId) as DocumentReference<Label_Storage>,
          labelNotebookRef = labelNotebookCollection(labelId).doc(notebookId) as DocumentReference<LabelNotebook_Write>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(labelRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot remove Notebook (${notebookId}) from a non-existing Label (${labelId}) for User (${userId}).`);
      const parentLabel = snapshot.data()!;

      // NOTE: there is no existence check for the LabelNotebook document by contract
      transaction.delete(labelNotebookRef);

      // FIXME: update Notebook's permissions based on the Label's permissions

      if(parentLabel.visibility === LabelVisibility.Public) {
        // FIXME: check if the Notebook is published and if so then also remove from the published collection
      } /* else -- the parent Label is private and nothing else needs to be done */
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error removing Notebook (${notebookId}) from Label (${labelId}) for User (${userId}). Reason: `, error);
  }
};

// --------------------------------------------------------------------------------
// NOTE: because Labels are hard-deleted, there no need to worry about doing this
//       in the same transaction. (This can just keep retrying until it succeeds.)
export const removeAllNotebooks = async (userId: UserIdentifier, labelId: LabelIdentifier) => {
  // TODO: this should retry until it succeeds
  try {
    const labelNotebookRefs = await labelNotebookCollection(labelId).listDocuments();
    await writeBatch(labelNotebookRefs.values(), (batch, notebookRef) => batch.delete(notebookRef))/*throws on error*/;

    // FIXME: remove all from Label Notebooks Published (doesn't check visibility
    //        to ensure any turds are removed)

    // FIXME: update Notebook's permissions to remove Label-related

  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error removing all Notebooks for Label (${labelId}) for User (${userId}). Reason: `, error);
  }
};

// == Reorder =====================================================================
export const reorderNotebooks = async (
  userId: UserIdentifier,
  labelId: LabelIdentifier, notebookOrder: NotebookIdentifier[]
): Promise<NotebookIdentifier[]> => {
  try {
    const labelRef = labelDocument(labelId);
    return await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(labelRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot reorder Notebooks on a non-existing Label (${labelId}) for User (${userId}).`);

      // FIXME: DO!!

      return notebookOrder/*FIXME*/;
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error reordering Notebooks on Label (${labelId}) for User (${userId}). Reason: `, error);
  }
};

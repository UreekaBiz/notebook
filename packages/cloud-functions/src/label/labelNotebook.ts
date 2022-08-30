import { DocumentReference } from 'firebase-admin/firestore';

import { LabelIdentifier, LabelVisibility, LabelNotebook_Update, Label_Storage, NotebookIdentifier, Notebook_Storage, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { notebookDocument } from '../notebook/datastore';
import { ApplicationError } from '../util/error';
import { ServerTimestamp, arrayUnion, arrayRemove } from '../util/firestore';
import { labelDocument } from './datastore';

// ********************************************************************************
// == Add =========================================================================
export const addNotebook = async (
  userId: UserIdentifier,
  labelId: LabelIdentifier, notebookId: NotebookIdentifier
) => {
  try {
    const labelRef = labelDocument(labelId) as DocumentReference<LabelNotebook_Update>;
    const notebookRef = notebookDocument(notebookId) as DocumentReference<Notebook_Storage>;
    await firestore.runTransaction(async transaction => {
      // ensure that the parent Label exists (by contract)
      const labelSnapshot = await transaction.get(labelRef);
      if(!labelSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot add a Notebook (${notebookId}) to a non-existing Label (${labelId}) for User (${userId}).`);
      const parentLabel = labelSnapshot.data()! as Label_Storage;

      // ensure that the associated Notebook exists and is not deleted (by contract)
      const notebookSnapshot = await transaction.get(notebookRef);
      if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot add a non-existing Notebook (${notebookId}) to a Label (${labelId}) for User (${userId}).`);
      const notebook = notebookSnapshot.data()!;
      if(notebook.deleted) throw new ApplicationError('functions/not-found', `Cannot add a non-existing Notebook (${notebookId}) to a Label (${labelId}) for User (${userId}).`);

      const labelNotebook: LabelNotebook_Update = {
        notebookIds: arrayUnion(notebookId)/*append to end*/,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      await labelRef.update(labelNotebook);

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
    const labelRef = labelDocument(labelId) as DocumentReference<Label_Storage>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(labelRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot remove Notebook (${notebookId}) from a non-existing Label (${labelId}) for User (${userId}).`);
      const parentLabel = snapshot.data()!;

      // NOTE: the associated Notebook *may no longer exist* (therefore no check is made)

      const labelNotebook: LabelNotebook_Update = {
        notebookIds: arrayRemove(notebookId)/*append to end*/,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      await labelRef.update(labelNotebook);

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
  // FIXME: remove all from Label Notebooks Published (doesn't check visibility
  //        to ensure any turds are removed)
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
      const parentLabel = snapshot.data()!;

      // FIXME: ensure that each Notebook in the notebookOrder array exists and
      //        isn't deleted (by contract)

      const labelNotebook: LabelNotebook_Update = {
        notebookIds: notebookOrder,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      await labelRef.update(labelNotebook);

      if(parentLabel.visibility === LabelVisibility.Public) {
        // FIXME: check if the Notebook is published and if so then also remove from the published collection
      } /* else -- the parent Label is private and nothing else needs to be done */

      return notebookOrder;
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error reordering Notebooks on Label (${labelId}) for User (${userId}). Reason: `, error);
  }
};

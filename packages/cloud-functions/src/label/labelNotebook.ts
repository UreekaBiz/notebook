import { DocumentReference, Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { setChange, LabelIdentifier, LabelVisibility, LabelNotebook_Update, Label_Storage, NotebookIdentifier, Notebook_Storage, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { notebookDocument } from '../notebook/datastore';
import { ApplicationError } from '../util/error';
import { arrayUnion, arrayRemove, ServerTimestamp } from '../util/firestore';
import { labelDocument, notebookLabelsQuery } from './datastore';

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

      addLabelNotebook(transaction, labelRef, userId, notebookId);

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

// ................................................................................
const addLabelNotebook = (
  transaction: Transaction,
  labelRef: DocumentReference<LabelNotebook_Update>,
  userId: UserIdentifier, notebookId: NotebookIdentifier
) => {
  const labelNotebook: LabelNotebook_Update = {
    notebookIds: arrayUnion(notebookId)/*append to end*/,

    lastUpdatedBy: userId,
    updateTimestamp: ServerTimestamp/*by contract*/,
  };
  transaction.update(labelRef, labelNotebook)/*update so doesn't resurrect deleted*/;
};

// == Remove ======================================================================
export const removeNotebook = async (
  userId: UserIdentifier,
  labelId: LabelIdentifier, notebookId: NotebookIdentifier
) => {
  try {
    const labelRef = labelDocument(labelId) as DocumentReference<Label_Storage>;
    await firestore.runTransaction(async transaction => {
      const labelSnapshot = await transaction.get(labelRef);
      if(!labelSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot remove Notebook (${notebookId}) from a non-existing Label (${labelId}) for User (${userId}).`);
      const parentLabel = labelSnapshot.data()! as Label_Storage;

      // NOTE: the associated Notebook *may no longer exist* (therefore no check is made)

      removeLabelNotebook(transaction, labelRef, userId, notebookId);

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

// ................................................................................
const removeLabelNotebook = (
  transaction: Transaction,
  labelRef: DocumentReference<LabelNotebook_Update>,
  userId: UserIdentifier, notebookId: NotebookIdentifier
) => {
  const labelNotebook: LabelNotebook_Update = {
    notebookIds: arrayRemove(notebookId)/*append to end*/,

    lastUpdatedBy: userId,
    updateTimestamp: ServerTimestamp/*by contract*/,
  };
  transaction.update(labelRef, labelNotebook)/*update so doesn't resurrect deleted*/;
};

// --------------------------------------------------------------------------------
// NOTE: because Labels are hard-deleted, there no need to worry about doing this
//       in the same transaction. (This can just keep retrying until it succeeds.)
export const removeAllNotebooks = async (userId: UserIdentifier, labelId: LabelIdentifier) => {
  // FIXME: remove all from Label Notebooks Published (doesn't check visibility
  //        to ensure any turds are removed)
};

// == Update ======================================================================
export const updateNotebook = async (
  userId: UserIdentifier,
  notebookId: NotebookIdentifier, labelIds: LabelIdentifier[]
): Promise<LabelIdentifier[]> => {
  try {
    const notebookRef = notebookDocument(notebookId);
    return await firestore.runTransaction(async transaction => {
      const notebookSnapshot = await transaction.get(notebookRef);
      if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot update Labels for a non-existing Notebook (${notebookId}) for User (${userId}).`);
      const notebook = notebookSnapshot.data()!;
      // FIXME: push down the ability to check the roles of the user specifically to
      //        be able to check if the User is also an admin
      if(notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot update Labels for Notebook (${notebookId}) since not created by User (${userId}).`);
      if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot update Labels for deleted Notebook (${notebookId}) for User (${userId}).`);

      // get all Labels that are currently associated with the Notebook
      const labelsSnapshot = await notebookLabelsQuery(notebookId).get();
      const currentLabelIds = new Set<LabelIdentifier>(labelsSnapshot.docs.map(doc => doc.id));

      // based on the difference in the two sets:
      // 1. get any added / removed Labels, check that the Label exists and that
      //    the User is the Creator
      // 2. add / remove the Notebook from the Label
      // NOTE: all reads must occur before any writes (by Firestore contract)
      const changes = setChange(currentLabelIds, new Set(labelIds));

      // CHECK: move to Promise.all()?
      const addLabelIds: LabelIdentifier[] = [],
            removeLabelIds: LabelIdentifier[] = [];
      for await (const labelId of changes.added) { if(await isValidLabel(transaction, userId, labelId, notebookId)) addLabelIds.push(labelId); }
      for await (const labelId of changes.removed) { if(await isValidLabel(transaction, userId, labelId, notebookId)) removeLabelIds.push(labelId); }

      addLabelIds.forEach(labelId => addLabelNotebook(transaction, labelDocument(labelId), userId, notebookId));
      removeLabelIds.forEach(labelId => removeLabelNotebook(transaction, labelDocument(labelId), userId, notebookId));

      return [...changes.unchanged, ...addLabelIds];
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating Labels on Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }
};

// ................................................................................
// determines if the specified Label exists and is created by the specified User
const isValidLabel = async (
  transaction: Transaction,
  userId: UserIdentifier, labelId: LabelIdentifier, notebookId: NotebookIdentifier
): Promise<boolean> => {
  const labelRef = labelDocument(labelId);
  const snapshot = await transaction.get(labelRef);
  if(!snapshot.exists) { logger.info(`Label (${labelId}) does not exist for Notebook (${notebookId}) update for User (${userId}).`); return false; }
  const label = snapshot.data()!;
  if(label.createdBy !== userId) { logger.info(`Label (${labelId}) not visible for Notebook (${notebookId}) update since not created by User (${userId}).`); return false; }

  return true/*valid*/;
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

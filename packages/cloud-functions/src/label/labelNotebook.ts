import { DocumentReference, Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { setChange, LabelIdentifier, LabelNotebook_Update, Label_Storage, NotebookIdentifier, Notebook_Storage, SystemUserId, UserIdentifier, MAX_LABEL_NOTEBOOKS } from '@ureeka-notebook/service-common';

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
      // ensure that the parent Label exists and is created by the User
      const labelSnapshot = await transaction.get(labelRef);
      if(!labelSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot add a Notebook (${notebookId}) to a non-existing Label (${labelId}) for User (${userId}).`);
      const label = labelSnapshot.data()! as Label_Storage;
      if(label.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot add Notebook (${notebookId}) to Label (${labelId}) not created by User (${userId}).`);

      // if the Notebook is already associated with the Label, then done, otherwise
      // ensure not over the maximum number of Notebooks per Label
      if(label.notebookIds.includes(notebookId)) return/*already associated*/;
      if(label.notebookIds.length >= MAX_LABEL_NOTEBOOKS) throw new ApplicationError('functions/invalid-argument', `Cannot add Notebook (${notebookId}) to Label (${labelId}) since it already has the maximum number of Notebooks (${MAX_LABEL_NOTEBOOKS}).`);

      // ensure that the associated Notebook exists and is not deleted (by contract)
      // NOTE: intentionally *not* checking if the Notebook is at least viewable by
      //       the User (by contract)
      // SEE: Label#notebookIds
      const notebookSnapshot = await transaction.get(notebookRef);
      if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot add a non-existing Notebook (${notebookId}) to a Label (${labelId}) for User (${userId}).`);
      const notebook = notebookSnapshot.data()!;
      if(notebook.deleted) throw new ApplicationError('functions/not-found', `Cannot add a non-existing Notebook (${notebookId}) to a Label (${labelId}) for User (${userId}).`);

      addLabelNotebook(transaction, labelRef, userId, notebookId);
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error adding Notebook (${notebookId}) to Label (${labelId}) for User (${userId}). Reason: `, error);
  }

  // NOTE: on-write trigger clones the Published Label
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
      // ensure that the parent Label exists and is created by the User (by contract)
      const labelSnapshot = await transaction.get(labelRef);
      if(!labelSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot remove Notebook (${notebookId}) from a non-existing Label (${labelId}) for User (${userId}).`);
      const label = labelSnapshot.data()! as Label_Storage;
      if(label.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot remove Notebook (${notebookId}) from Label (${labelId}) not created by User (${userId}).`);

      // if the Notebook isn't already associated with the Label, then done
      if(!label.notebookIds.includes(notebookId)) return/*not associated*/;

      // NOTE: the associated Notebook *may no longer exist* (therefore no check is made)
      // NOTE: the same is true about the fact that the Notebook may no longer be
      //       viewable by the caller
      // SEE: Label#notebookIds

      removeLabelNotebook(transaction, labelRef, userId, notebookId);
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error removing Notebook (${notebookId}) from Label (${labelId}) for User (${userId}). Reason: `, error);
  }

  // NOTE: on-write trigger clones the Published Label
};

// -- Remove All ------------------------------------------------------------------
// NOTE: logs on error since a dependent function
export const removeNotebookFromAllLabels = async (
  userId: UserIdentifier, notebookId: NotebookIdentifier
) => {
  try {
    await firestore.runTransaction(async transaction => {
      // NOTE: *no* check is made to ensure that the Notebook exists, is not deleted
      //       or is still viewable by the User. This is simply a data-integrity
      //       step and the caller has already ensured that the Notebook is owned
      //       by the caller.

      // find all Labels that have the Notebook associated with them
      const labelSnapshots = await transaction.get(notebookLabelsQuery(notebookId));
      if(labelSnapshots.empty) return/*no Labels associated with the Notebook so nothing to do*/;

      // remove the Notebook from each Label
      // NOTE: this explicitly does *not* check if the User created the Label since
      //       the Notebook is going away. In other words, the alterative is to
      //       leave now-deleted Notebooks associated the Label which will lead to
      //       data integrity issues.
      // NOTE: this uses the System User in the case where the Label is not owned
      //       by the calling User so that a non-owner is never shown as an updater
      //       of a Label.
      labelSnapshots.forEach(snapshot => {
        const label = snapshot.data();
        const removeUserId = (label.createdBy === userId) ? userId : SystemUserId/*by contract*/;
        removeLabelNotebook(transaction, snapshot.ref, removeUserId, notebookId);
      });
    });
  } catch(error) {
    // NOTE: logs by contract
    logger.error(`Error removing Notebook (${notebookId}) from all Labels for User (${userId}). Reason: `, error);
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
// given a Notebook, set the Label's associated with it
export const updateNotebook = async (
  userId: UserIdentifier,
  notebookId: NotebookIdentifier, labelIds: LabelIdentifier[]
): Promise<LabelIdentifier[]> => {
  try {
    const notebookRef = notebookDocument(notebookId);
    return await firestore.runTransaction(async transaction => {
      // the Notebook must exists and not be deleted (by contract)
      // NOTE: no check is made to ensure that the Notebook is viewable by the User
      //       since it's possible that the Notebook was viewable and has since been
      //       un-Shared (by contract)
      const notebookSnapshot = await transaction.get(notebookRef);
      if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot update Labels for a non-existing Notebook (${notebookId}) for User (${userId}).`);
      const notebook = notebookSnapshot.data()!;
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

      // TODO: ensure that there are not more than MAX_LABEL_NOTEBOOKS per Label!
      // CHECK: move to Promise.all()?
      const addLabelIds: LabelIdentifier[] = [],
            removeLabelIds: LabelIdentifier[] = [];
      for await (const labelId of changes.added) { if(await isValidLabel(transaction, 'add', labelId, userId, notebookId)) addLabelIds.push(labelId); }
      for await (const labelId of changes.removed) { if(await isValidLabel(transaction, 'remove', labelId, userId, notebookId)) removeLabelIds.push(labelId); }

      addLabelIds.forEach(labelId => addLabelNotebook(transaction, labelDocument(labelId), userId, notebookId));
      removeLabelIds.forEach(labelId => removeLabelNotebook(transaction, labelDocument(labelId), userId, notebookId));

      return [...changes.unchanged, ...addLabelIds];
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating Labels on Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }

  // NOTE: on-write trigger clones the Published Label
};

// ................................................................................
// determines if the specified Label exists and is created by the specified User
const isValidLabel = async (
  transaction: Transaction, action: 'add' | 'remove',
  labelId: LabelIdentifier,
  userId: UserIdentifier, notebookId: NotebookIdentifier
): Promise<boolean> => {
  const labelRef = labelDocument(labelId);
  const snapshot = await transaction.get(labelRef);
  if(!snapshot.exists) { logger.info(`Label (${labelId}) does not exist for Notebook (${notebookId}) update for User (${userId}).`); return false; }
  const label = snapshot.data()!;
  if(label.createdBy !== userId) { logger.info(`Label (${labelId}) not visible for Notebook (${notebookId}) update since not created by User (${userId}).`); return false; }

  // NOTE: no need to check if the Notebook is already in the set since that would
  //       have been determined before this
  if((action === 'add') && (label.notebookIds.length >= MAX_LABEL_NOTEBOOKS)) { logger.info(`Label (${labelId}) already has the maximum number of Notebooks (${MAX_LABEL_NOTEBOOKS}) for Notebook (${notebookId}) update for User (${userId}).`); return false; }
  // NOTE: nothing additional for 'remove' actions

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
      const label = snapshot.data()!;
      if(label.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot reorder Notebooks on Label (${labelId}) not created by User (${userId}).`);

      // NOTE: explicitly *no* check for for Notebook visibility
      // FIXME: remove any Notebooks that no longer exist or are (soft) deleted
      //        to be consistent with #removeNotebookFromAllLabels()

      const labelNotebook: LabelNotebook_Update = {
        notebookIds: notebookOrder,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      await labelRef.update(labelNotebook);

      return notebookOrder;
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error reordering Notebooks on Label (${labelId}) for User (${userId}). Reason: `, error);
  }

  // NOTE: on-write trigger clones the Published Label
};

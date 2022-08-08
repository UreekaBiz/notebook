import { DocumentReference } from 'firebase-admin/firestore';

import { LabelIdentifier, LabelVisibility, LabelNotebook_Write, Label_Storage, NotebookIdentifier, Notebook_Storage, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { writeBatch, ServerTimestamp } from '../util/firestore';
import { labelDocument, labelNotebookCollection, labelNotebookDocument } from './datastore';
import { updateLabelSummary } from './labelSummary';
import { notebookDocument } from 'notebook/datastore';

// ********************************************************************************
// == Add =========================================================================
export const addNotebook = async (
  userId: UserIdentifier,
  labelId: LabelIdentifier, notebookId: NotebookIdentifier
) => {
  try {
    const labelRef = labelDocument(labelId) as DocumentReference<Label_Storage>,
          labelNotebookRef = labelNotebookDocument(labelId, notebookId) as DocumentReference<LabelNotebook_Write>;
    const notebookRef = notebookDocument(notebookId) as DocumentReference<Notebook_Storage>;
    const { parentLabel } = await firestore.runTransaction(async transaction => {
      // ensure that the parent Label exists (by contract)
      const labelSnapshot = await transaction.get(labelRef);
      if(!labelSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot add a Notebook (${notebookId}) to a non-existing Label (${labelId}) for User (${userId}).`);
      const parentLabel = labelSnapshot.data()!;

      // ensure that the associated Notebook exists (by contract)
      const notebookSnapshot = await transaction.get(notebookRef);
      if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot add a non-existing Notebook (${notebookId}) to a Label (${labelId}) for User (${userId}).`);
      const notebook = notebookSnapshot.data()!;

      const labelNotebook: LabelNotebook_Write = {
        labelId,
        notebookId,

        name: parentLabel.name,
        order: ServerTimestamp/*by contract*/,

        createdBy: userId,
        createTimestamp: ServerTimestamp/*by contract*/,
      };
      await labelNotebookRef.set(labelNotebook)/*'set' and not 'create' by contract*/;

      // FIXME: update Notebook's permissions based on the Label's permissions

      if(parentLabel.visibility === LabelVisibility.Public) {
        // FIXME: check if the Notebook is published and if so then also write to the published collection
      } /* else -- the parent Label is private and nothing else needs to be done */

      return { parentLabel, notebook };
    });

    await updateLabelSummary(userId, labelId, parentLabel.visibility, 1/*increment*/)/*logs on error*/;
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
          labelNotebookRef = labelNotebookDocument(labelId, notebookId) as DocumentReference<LabelNotebook_Write>;
    const parentLabel = await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(labelRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot remove Notebook (${notebookId}) from a non-existing Label (${labelId}) for User (${userId}).`);
      const parentLabel = snapshot.data()!;

      // NOTE: the associated Notebook *may no longer exist* (therefore no check is made)

      // NOTE: there is no existence check for the LabelNotebook document by contract
      transaction.delete(labelNotebookRef);

      // FIXME: update Notebook's permissions based on the Label's permissions

      if(parentLabel.visibility === LabelVisibility.Public) {
        // FIXME: check if the Notebook is published and if so then also remove from the published collection
      } /* else -- the parent Label is private and nothing else needs to be done */

      return parentLabel;
    });

    await updateLabelSummary(userId, labelId, parentLabel.visibility, -1/*decrement*/)/*logs on error*/;
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

    // NOTE: Label handles updating (removing) Label Summaries
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

    // FIXME: update Label Summary
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error reordering Notebooks on Label (${labelId}) for User (${userId}). Reason: `, error);
  }
};

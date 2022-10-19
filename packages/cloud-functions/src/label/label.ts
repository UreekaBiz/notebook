import { DocumentReference } from 'firebase-admin/firestore';

import { computeLabelPrefixes, computeLabelSortName, isBlank, removeUndefined, LabelIdentifier, LabelVisibility, Label_Create, Label_Storage, Label_Update, SystemUserId, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { DeleteField, ServerTimestamp } from '../util/firestore';
import { labelCollection, labelDocument } from './datastore';
import { removeAllNotebooks } from './labelNotebook';

// ********************************************************************************
// == Create ======================================================================
export const createLabel = async (
  userId: UserIdentifier,
  name: string, description: string | null | undefined, visibility: LabelVisibility, ordered: boolean
): Promise<LabelIdentifier> => {
  if(isBlank(name)) throw new ApplicationError('functions/invalid-argument', `Cannot create a Label with a blank name.`);

  const labelRef = labelCollection.doc(/*create new*/) as DocumentReference<Label_Create>,
        labelId = labelRef.id;
  try {
    const label: Label_Create = {
      name,
      description: (description === null/*specified but no value*/) ? undefined/*collapse on create*/ : description,

      visibility,
      ordered,

      notebookIds: [/*none by default on create*/],

      viewers: [userId/*creator must be a viewer by contract*/],
      editors: [userId/*creator must be an editor by contract*/],

      sortName: computeLabelSortName(name),
      searchNamePrefixes: computeLabelPrefixes(name),

      createdBy: userId,
      createTimestamp: ServerTimestamp/*by contract*/,
      lastUpdatedBy: userId,
      updateTimestamp: ServerTimestamp/*by contract*/,
    };
    await labelRef.create(removeUndefined(label) as Label_Create)/*create by definition*/;
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error creating new Label for User (${userId}). Reason: `, error);
  }

  // NOTE: on-write trigger creates the Published Label

  return labelId;
};

// == Update ======================================================================
export const updateLabel = async (
  userId: UserIdentifier,
  labelId: LabelIdentifier,
  name: string, description: string | null | undefined, visibility: LabelVisibility, ordered: boolean
) => {
  if(isBlank(name)) throw new ApplicationError('functions/invalid-argument', `Cannot update a Label to a blank name.`);

  try {
    const labelRef = labelDocument(labelId) as DocumentReference<Label_Update>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(labelRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot update non-existing Label (${labelId}) for User (${userId}).`);
      const existingLabel = snapshot.data()! as Label_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the User specifically to
      //        be able to check if the User is also an Admin
      if(existingLabel.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot update Label (${labelId}) not created by User (${userId}).`);

      const label: Label_Update = {
        name,
        description: (description === null/*specified but no value*/) ? DeleteField : description,

        visibility,
        ordered,

        sortName: computeLabelSortName(name),
        searchNamePrefixes: computeLabelPrefixes(name),

        lastUpdatedBy: SystemUserId/*by contract*/,
        updateTimestamp: ServerTimestamp/*server-written*/,
      };
      transaction.update(labelRef, removeUndefined(label));
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating Label (${labelId}) for User (${userId}). Reason: `, error);
  }

  // NOTE: on-write trigger clones the Published Label
};

// -- Notebook --------------------------------------------------------------------
// SEE ./labelNotebook.ts

// == Delete ======================================================================
export const deleteLabel = async (userId: UserIdentifier, labelId: LabelIdentifier) => {
  try {
    const labelRef = labelDocument(labelId);
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(labelRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot delete non-existing Label (${labelId}) for User (${userId}).`);
      const existingLabel = snapshot.data()! as Label_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the user specifically to
      //        be able to check if the User is also an admin
      if(existingLabel.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot delete Label (${labelId}) not created by User (${userId}).`);

      transaction.delete(labelRef);
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error deleting Label (${labelId}) for User (${userId}). Reason: `, error);
  }

  await removeAllNotebooks(userId, labelId)/*logs on error*/;
  // NOTE: on-write trigger deletes the Published Label
};

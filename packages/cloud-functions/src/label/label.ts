import { DocumentReference } from 'firebase-admin/firestore';

import { computeLabelPrefixes, computeLabelSortName, isBlank, LabelIdentifier, LabelVisibility, Label_Create, Label_Storage, Label_Update, SystemUserId, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { labelCollection, labelDocument } from './datastore';
import { removeAllNotebooks } from './labelNotebook';
import { createLabelSummary, deleteLabelSummary } from './labelSummary';

// ********************************************************************************
// == Create ======================================================================
export const createLabel = async (
  userId: UserIdentifier,
  name: string, visibility: LabelVisibility, ordered: boolean
): Promise<LabelIdentifier> => {
  if(isBlank(name)) throw new ApplicationError('functions/invalid-argument', `Cannot create a Label with a blank name.`);

  try {
    const labelRef = labelCollection.doc(/*create new*/) as DocumentReference<Label_Create>,
          labelId = labelRef.id;
    const label: Label_Create = {
      name,
      visibility,
      ordered,

      viewers: [userId/*creator must be a viewer by contract*/],
      editors: [userId/*creator must be an editor by contract*/],

      sortName: computeLabelSortName(name),
      searchNamePrefixes: computeLabelPrefixes(name),

      createdBy: userId,
      createTimestamp: ServerTimestamp/*by contract*/,
      lastUpdatedBy: userId,
      updateTimestamp: ServerTimestamp/*by contract*/,
    };
    await labelRef.create(label)/*create by definition*/;

    // NOTE: it *is* possible for the Summary to fail. Cleanup *should* either
    //       retry or remove the parent Label and error out.
    await createLabelSummary(userId, labelId, visibility)/*logs on error*/;

    // FIXME: publish if visibility === LabelVisibility.Public

    return labelId;
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error creating new Label for User (${userId}). Reason: `, error);
  }
};

// == Update ======================================================================
export const updateLabel = async (
  userId: UserIdentifier,
  labelId: LabelIdentifier, name: string, visibility: LabelVisibility, ordered: boolean
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

        visibility,
        ordered,

        sortName: computeLabelSortName(name),
        searchNamePrefixes: computeLabelPrefixes(name),

        lastUpdatedBy: SystemUserId/*by contract*/,
        updateTimestamp: ServerTimestamp/*server-written*/,
      };
      transaction.update(labelRef, label);

      // NOTE: Label Summary does not change for Label updates (only Label Notebooks)

      // FIXME: trickle down to sub-collections!!!
      // FIXME: compare visibility to existing and either publish or unpublish or nothing

    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error deleting Label (${labelId}) for User (${userId}). Reason: `, error);
  }
};

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

    await removeAllNotebooks(userId, labelId)/*logs on error*/;
    await deleteLabelSummary(userId, labelId)/*logs on error*/;

    // FIXME: remove any published labels!!! (do it in all cases for sanity)

  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error deleting Label (${labelId}) for User (${userId}). Reason: `, error);
  }
};

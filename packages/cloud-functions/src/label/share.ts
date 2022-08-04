import { DocumentReference } from 'firebase-admin/firestore';

import { LabelIdentifier, Label_Storage, Label_Update, ShareRole, UserIdentifier, MAX_LABEL_SHARE_USERS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { labelCollection } from './datastore';

// Label sharing
// ********************************************************************************
export const shareLabel = async (userId: UserIdentifier, labelId: LabelIdentifier, userRoles: Map<UserIdentifier, ShareRole>) => {
  // optimistically force the caller to be the Creator of the Label
  // NOTE: the Transaction ensures that the caller -is- the Creator of the Label
  userRoles.set(userId!/*auth'd*/, ShareRole.Creator);

  // bound to MAX_LABEL_SHARE_USERS and ensure that there is only a single Creator
  if(userRoles.size > MAX_LABEL_SHARE_USERS) throw new ApplicationError('functions/invalid-argument', `Cannot Share a Label (${labelId}) with more than ${MAX_LABEL_SHARE_USERS} (${userRoles.size} > ${MAX_LABEL_SHARE_USERS}) Users.`);
  const creatorUserIds = [...userRoles.values()].filter(role => role === ShareRole.Creator);
  if(creatorUserIds.length > 1) throw new ApplicationError('functions/invalid-argument', `Cannot Share a Label (${labelId}) with more than one Creator (${creatorUserIds.length} > 1).`);

  // NOTE: each of viewers and editor must be unique by UserIdentifier by contract
  // NOTE: all Editors (and Creator) are Viewers by contract
  const viewers = new Map<UserIdentifier, ShareRole>(userRoles.entries())/*all roles are at least Viewer*/,
        editors = new Map<UserIdentifier, ShareRole>([...userRoles.entries()].filter(([_, role]) => ((role === ShareRole.Editor) || (role === ShareRole.Creator))/*explicit for sanity / security*/));

  try {
    const labelRef = labelCollection.doc(labelId) as DocumentReference<Label_Update>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(labelRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot update Share for non-existing Label (${labelId}).`);
      const label = snapshot.data()! as Label_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the user specifically to
      //        be able to check if the User is also an admin
      if(label.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot update for Share on Label (${labelId}) since created by User (${userId}).`);

      const update: Label_Update = {
        viewers: [...viewers.keys()],
        editors: [...editors.keys()],

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.set(labelRef, update, { merge: true });
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating Share for Label (${labelId}). Reason: `, error);
  }
};

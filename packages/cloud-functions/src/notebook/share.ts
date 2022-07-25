import { DocumentReference } from 'firebase-admin/firestore';

import { NotebookIdentifier, NotebookRole, Notebook_Storage, Notebook_Update, UserIdentifier, MAX_NOTEBOOK_SHARE_USERS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { notebookCollection } from './datastore';

// Notebook sharing
// ********************************************************************************
export const shareNotebook = async (userId: UserIdentifier, notebookId: NotebookIdentifier, userRoles: Map<UserIdentifier, NotebookRole>) => {
  // optimistically force the caller to be the Creator of the Notebook
  // NOTE: the Transaction ensures that the caller -is- the Creator of the Notebook
  userRoles.set(userId!/*auth'd*/, NotebookRole.Creator);

  // bound to MAX_NOTEBOOK_SHARE_USERS and ensure that there is only a single Creator
  if(userRoles.size > MAX_NOTEBOOK_SHARE_USERS) throw new ApplicationError('functions/invalid-argument', `Cannot Share a Notebook (${notebookId}) with more than ${MAX_NOTEBOOK_SHARE_USERS} (${userRoles.size} > ${MAX_NOTEBOOK_SHARE_USERS}) Users Notebook (${notebookId}).`);
  const creatorUserIds = [...userRoles.values()].filter(role => role === NotebookRole.Creator);
  if(creatorUserIds.length > 1) throw new ApplicationError('functions/invalid-argument', `Cannot Share a Notebook (${notebookId}) with more than one Creator (${creatorUserIds.length} > 1).`);

  // NOTE: each of viewers and editor must be unique by UserIdentifier by contract
  // NOTE: all Editors (and Creator) are Viewers by contract
  const viewers = new Map<UserIdentifier, NotebookRole>(userRoles.entries())/*all roles are at least Viewer*/,
        editors = new Map<UserIdentifier, NotebookRole>([...userRoles.entries()].filter(([_, role]) => ((role === NotebookRole.Editor) || (role === NotebookRole.Creator))/*explicit for sanity / security*/));

  try {
    const notebookRef = notebookCollection.doc(notebookId) as DocumentReference<Notebook_Update>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(notebookRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot update Share for non-existing Notebook (${notebookId}).`);
      const notebook = snapshot.data()! as Notebook_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the user specifically to
      //        be able to check if the User is also an admin
      if(notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot update for Share on Notebook (${notebookId}) since created by User (${userId}).`);
      if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot update deleted Notebook (${notebookId}).`);

      const update: Notebook_Update = {
        viewers: [...viewers.keys()],
        editors: [...editors.keys()],

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.set(notebookRef, update, { merge: true });
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating Share for Notebook (${notebookId}). Reason: `, error);
  }
};

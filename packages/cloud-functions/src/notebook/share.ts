import { DocumentReference } from 'firebase-admin/firestore';

import { difference, NotebookIdentifier, NotebookRole, Notebook_Storage, Notebook_Update, UserIdentifier, MAX_NOTEBOOK_SHARE_USERS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { enqueueTask, TaskDefinition, TaskQueue } from '../util/google/task';
import { notebookCollection } from './datastore';
import { ShareBatchNotification_Rest } from './function';
import { TARGET_NOTEBOOK_SHARE_BATCH_NOTIFICATION } from './task';

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
  const viewerUserIds = [...viewers.keys()],
        editorUserIds = [...editors.keys()];

  let newShareUserIds: Set<UserIdentifier>;
  try {
    const notebookRef = notebookCollection.doc(notebookId) as DocumentReference<Notebook_Update>;
    newShareUserIds = await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(notebookRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot update Share for non-existing Notebook (${notebookId}).`);
      const notebook = snapshot.data()! as Notebook_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the user specifically to
      //        be able to check if the User is also an admin
      if(notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot update for Share on Notebook (${notebookId}) since created by User (${userId}).`);
      if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot update deleted Notebook (${notebookId}).`);

      const update: Notebook_Update = {
        viewers: viewerUserIds,
        editors: editorUserIds,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.set(notebookRef, update, { merge: true });

      // compute and return the set of *new* Users to share with
      return new Set<UserIdentifier>([
        ...difference(viewerUserIds, notebook.viewers)/*UserIds in the updated Viewers that are not in the existing Viewers*/,
        ...difference(editorUserIds, notebook.editors)/*UserIds in the updated Editors that are not in the existing Editors*/,
      ]);
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating Share for Notebook (${notebookId}). Reason: `, error);
  }

  // send notifications to the new Users
  await notifyShare(notebookId, newShareUserIds)/*logs on error*/;
};

// ................................................................................
// enqueue a Task to notify the Users who have been added to the Share
// NOTE: this doesn't notify each User individually, but rather enqueues a batch Task
//       to limit the amount of time to perform this function
const notifyShare = async (notebookId: NotebookIdentifier, newShareUserIds: Set<UserIdentifier>) => {
  if(newShareUserIds.size < 1) return/*nothing to do*/;

  const taskDefinition: TaskDefinition<ShareBatchNotification_Rest> = {
    taskQueue: TaskQueue.BatchDispatchNotification,
    targetFunctionName: TARGET_NOTEBOOK_SHARE_BATCH_NOTIFICATION,
    taskBody: {
      notebookId,

      userIds: [...newShareUserIds],
    },
    // NOTE: no scheduleDateTime since this should occur immediately
  };
  return await enqueueTask(taskDefinition)/*logs on error*/;
};

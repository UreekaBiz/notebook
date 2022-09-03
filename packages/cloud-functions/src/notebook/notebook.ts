import { DocumentReference, Transaction } from 'firebase-admin/firestore';

import { extractDocumentName, isNotebookRole, setChange, DocumentNodeType, NotebookIdentifier, NotebookType, NotebookSchemaVersion, Notebook_Create, Notebook_Delete, Notebook_Hashtag, Notebook_Publish, Notebook_Rename, Notebook_Storage, SetChange, ShareRole, SystemUserId, UserIdentifier, MAX_NOTEBOOK_HASHTAGS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { updateHashtagOccurrences } from '../hashtag/hashtagSummary';
import { removeNotebookFromAllLabels } from '../label/labelNotebook';
import { ApplicationError } from '../util/error';
import { getSnapshot, ServerTimestamp } from '../util/firestore';
import { notebookCollection, notebookDocument } from './datastore';

// ********************************************************************************
// == Get =========================================================================
// ensure that the Notebook document still exists (i.e. has not been deleted
// either hard or soft) and that the caller has the right permissions based on the
// specified ShareRole
export const getNotebook = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier,
  notebookId: NotebookIdentifier, role: ShareRole,
  label: string/*context*/
): Promise<Notebook_Storage> => {
  const notebookRef = notebookCollection.doc(notebookId);
  const snapshot = await getSnapshot(transaction, notebookRef);
  if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot ${label} on non-existing Notebook (${notebookId}) for User (${userId}).`);
  const notebook = snapshot.data()!;

  // FIXME: push down the ability to check the roles of the user specifically to
  //        be able to check if the User is also an admin
  if(!isNotebookRole(userId, notebook, role)) throw new ApplicationError('functions/permission-denied', `Cannot ${label} on Notebook (${notebookId}) where the User (${userId}) in not ${role}.`);

  if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot ${label} on already deleted Notebook (${notebookId}) for User (${userId}).`);

  return notebook;
};

// == Create ======================================================================
export const createNotebook = async (
  userId: UserIdentifier,
  type: NotebookType, name: string
): Promise<NotebookIdentifier> => {
  const schemaVersion = NotebookSchemaVersion.V2;
  try {
    const notebookRef = notebookCollection.doc(/*create new*/) as DocumentReference<Notebook_Create>,
          notebookId = notebookRef.id;
    const notebook: Notebook_Create = {
      type,
      schemaVersion,

      name,
      hashtags: [/*none by default*/],

      isPublished: false/*cannot be published at creation*/,

      viewers: [userId/*creator must be a viewer by contract*/],
      editors: [userId/*creator must be an editor by contract*/],

      deleted: false/*not deleted by default*/,

      createdBy: userId,
      createTimestamp: ServerTimestamp/*by contract*/,
      lastUpdatedBy: userId,
      updateTimestamp: ServerTimestamp/*by contract*/,
    };
    await notebookRef.create(notebook)/*create by definition*/;

    return notebookId;
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error creating new Notebook (Version ${schemaVersion}) for User (${userId}). Reason: `, error);
  }
};

// == Update ======================================================================
// -- Hashtag ---------------------------------------------------------------------
export const hashtagNotebook = async (userId: UserIdentifier, notebookId: NotebookIdentifier, hashtags: Set<string/*hashtag*/>) => {
  if(hashtags.size > MAX_NOTEBOOK_HASHTAGS) throw new ApplicationError('functions/invalid-argument', `Cannot have a Notebook (${notebookId}) with more than ${MAX_NOTEBOOK_HASHTAGS} (${hashtags.size} > ${MAX_NOTEBOOK_HASHTAGS}) Hashtags.`);

  let hashtagChanges: SetChange<string/*hashtag*/>;
  try {
    const notebookRef = notebookCollection.doc(notebookId) as DocumentReference<Notebook_Hashtag>;
    hashtagChanges = await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(notebookRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot update Hashtags for non-existing Notebook (${notebookId}).`);
      const notebook = snapshot.data()! as Notebook_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the user specifically to
      //        be able to check if the User is also an admin
      if(notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot update for Hashtags on Notebook (${notebookId}) since created by User (${userId}).`);
      if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot update Hashtags on deleted Notebook (${notebookId}).`);

      const update: Notebook_Hashtag = {
        hashtags: [...hashtags],

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.set(notebookRef, update, { merge: true });

      return setChange(new Set(notebook.hashtags), hashtags);
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating Hashtags for Notebook (${notebookId}). Reason: `, error);
  }

  // manage Hashtags based on what has changed
  await updateHashtagOccurrences(hashtagChanges.added, hashtagChanges.removed)/*logs on error*/;
};

// -- Publish ---------------------------------------------------------------------
// updates the published status of the specified Notebook
export const updateNotebookPublish = (transaction: Transaction, notebookId: NotebookIdentifier, isPublished: boolean) => {
  const notebookRef = notebookDocument(notebookId);
  const notebook: Notebook_Publish = {
    isPublished,

    lastUpdatedBy: SystemUserId/*by contract*/,
    updateTimestamp: ServerTimestamp/*server-written*/,
  };
  transaction.set(notebookRef, notebook, { merge: true });
};

// -- Rename ----------------------------------------------------------------------
// extracts meta-data (e.g. the Title) from the specified Notebook and updates the
// Notebook document (using the specified Transaction) as needed
// NOTE: currently only runs when Checkpoints are created
export const updateNotebookRename = (
  transaction: Transaction,
  version: NotebookSchemaVersion, notebookId: NotebookIdentifier,
  existingName: string, document: DocumentNodeType
) => {
  const name = extractDocumentName(version, notebookId, document);
  if(name === existingName) return/*nothing changed so don't bother to write*/;

  const notebookRef = notebookDocument(notebookId);
  const notebook: Notebook_Rename = {
    name,

    lastUpdatedBy: SystemUserId/*by contract*/,
    updateTimestamp: ServerTimestamp/*server-written*/,
  };
  transaction.set(notebookRef, notebook, { merge: true });
};

// == Delete ======================================================================
export const deleteNotebook = async (userId: UserIdentifier, notebookId: NotebookIdentifier) => {
  let result: { hashtagsRemoved: Set<string/*hashtag*/>; };
  try {
    const notebookRef = notebookCollection.doc(notebookId) as DocumentReference<Notebook_Delete>;
    result = await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(notebookRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot delete non-existing Notebook (${notebookId}) for User (${userId}).`);
      const existingNotebook = snapshot.data()! as Notebook_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the user specifically to
      //        be able to check if the User is also an admin
      if(existingNotebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot delete Notebook (${notebookId}) not created by User (${userId}).`);
      if(existingNotebook.deleted) throw new ApplicationError('data/deleted', `Cannot delete already deleted Notebook (${notebookId}) for User (${userId}).`);

      // CHECK: should this force the editors and viewers list to be culled?
      //        Gut says 'yes' to reduce the 'attack surface' of a deleted Notebook.
      //        (Undeleting it would leave it in a 'raw' state which is likely fine.)
      const notebook: Notebook_Delete = {
        deleted: true/*by definition*/,

        lastUpdatedBy: userId,
        updateTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.set(notebookRef, notebook, { merge: true });

      return { hashtagsRemoved: new Set(existingNotebook.hashtags) };
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error deleting Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }

  // remove associated Hashtags and Labels
  // CHECK: move to on-delete Notebook trigger for end-User performance / responsiveness?
  await updateHashtagOccurrences(undefined/*none added*/, result.hashtagsRemoved)/*logs on error*/;
  await removeNotebookFromAllLabels(userId, notebookId)/*logs on error*/;
};

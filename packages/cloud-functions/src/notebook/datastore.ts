import { CollectionReference } from 'firebase-admin/firestore';

import { nameof, notebooksKey, notebooksNotebookKey, notebooksNotebookUserKey, notebooksNotebookUserSessionKey, Notebook, NotebookIdentifier, NotebookPublishedContent_Storage, NotebookPublished_Storage, NotebookUserSession_Storage, SessionIdentifier, UserIdentifier, NOTEBOOKS, NOTEBOOK_PUBLISHEDS, NOTEBOOK_PUBLISHED_CONTENTS } from '@ureeka-notebook/service-common';

import { database, firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: notebook/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Notebook --------------------------------------------------------------------
export const notebookCollection = firestore.collection(NOTEBOOKS) as CollectionReference<Notebook>;
export const notebookDocument = (notebookId: NotebookIdentifier) => notebookCollection.doc(notebookId);

// -- Notebook Published ----------------------------------------------------------
export const notebookPublishedCollection = firestore.collection(NOTEBOOK_PUBLISHEDS) as CollectionReference<NotebookPublished_Storage>;
export const notebookPublishedDocument = (notebookId: NotebookIdentifier) => notebookPublishedCollection.doc(notebookId);

export const notebookPublishedContentCollection = firestore.collection(NOTEBOOK_PUBLISHED_CONTENTS) as CollectionReference<NotebookPublishedContent_Storage>;
export const notebookPublishedContentDocument = (notebookId: NotebookIdentifier) => notebookPublishedContentCollection.doc(notebookId);

// ** RTDB ************************************************************************
// == Notebook User-Session =======================================================
export const notebooksRef = database.ref(notebooksKey);
export const notebookUsersRef = (notebookId: NotebookIdentifier) => database.ref(notebooksNotebookKey(notebookId));
export const notebookUserRef = (notebookId: NotebookIdentifier, userId: UserIdentifier) => database.ref(notebooksNotebookUserKey(notebookId, userId));
export const notebookUserSessionsRef = (notebookId: NotebookIdentifier, userId: UserIdentifier, sessionId: SessionIdentifier) => database.ref(notebooksNotebookUserSessionKey(notebookId, userId, sessionId));

// == Query =======================================================================
// retrieves all Notebook User-Sessions for a given User and Session
// CHECK: there's no limit since it's a human-scale problem (i.e. that human would
//        have needed to open all of those Notebooks)
// NOTE: there is no way to index this query:
//       https://stackoverflow.com/questions/40656589/firebase-query-if-child-of-child-contains-a-value
export const notebookUserSessionQuery = (userId: UserIdentifier, sessionId: SessionIdentifier) =>
  notebooksRef.orderByChild(`${userId}/${sessionId}/${nameof<NotebookUserSession_Storage>('timestamp')}`)
             .startAt(0/*timestamps are numeric so anything before this is null (meaning it doesn't exist)*/);

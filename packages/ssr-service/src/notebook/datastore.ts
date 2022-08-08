import { CollectionReference } from 'firebase-admin/firestore';

import { NotebookIdentifier, NotebookPublished_Storage, NotebookPublishedContent_Storage, NOTEBOOK_PUBLISHEDS, NOTEBOOK_PUBLISHED_CONTENTS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Notebook Published ----------------------------------------------------------
export const notebookPublishedCollection = firestore.collection(NOTEBOOK_PUBLISHEDS) as CollectionReference<NotebookPublished_Storage>;
export const notebookPublishedDocument = (notebookId: NotebookIdentifier) => notebookPublishedCollection.doc(notebookId);

export const notebookPublishedContentCollection = firestore.collection(NOTEBOOK_PUBLISHED_CONTENTS) as CollectionReference<NotebookPublishedContent_Storage>;
export const notebookPublishedContentDocument = (notebookId: NotebookIdentifier) => notebookPublishedContentCollection.doc(notebookId);

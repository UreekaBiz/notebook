import { CollectionReference } from 'firebase-admin/firestore';

import { Notebook, NotebookIdentifier, NotebookPublishedContent_Storage, NotebookPublished_Storage, NOTEBOOKS, NOTEBOOK_PUBLISHEDS, NOTEBOOK_PUBLISHED_CONTENTS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';

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

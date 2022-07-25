import { CollectionReference } from 'firebase-admin/firestore';

import { Notebook, NotebookIdentifier, PublishedNotebook, NOTEBOOKS, NOTEBOOK_PUBLISHED_NOTEBOOKS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: notebook/datastore.ts

// == Collection ==================================================================
// -- Notebook --------------------------------------------------------------------
export const notebookCollection = firestore.collection(NOTEBOOKS) as CollectionReference<Notebook>;
export const notebookDocument = (notebookId: NotebookIdentifier) => notebookCollection.doc(notebookId);

// -- Published Notebook ----------------------------------------------------------
export const publishedNotebookCollection = firestore.collection(NOTEBOOK_PUBLISHED_NOTEBOOKS) as CollectionReference<PublishedNotebook>;
export const publishedNotebookDocument = (notebookId: NotebookIdentifier) => publishedNotebookCollection.doc(notebookId);

import { CollectionReference } from 'firebase-admin/firestore';

import { NotebookIdentifier, PublishedNotebook, NOTEBOOK_PUBLISHED_NOTEBOOKS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: notebook/datastore.ts

// == Collections =================================================================
// .. Published Notebook ..........................................................
export const publishedNotebookCollection = firestore.collection(NOTEBOOK_PUBLISHED_NOTEBOOKS) as CollectionReference<PublishedNotebook>;
export const publishedNotebookDocument = (notebookId: NotebookIdentifier) => publishedNotebookCollection.doc(notebookId);

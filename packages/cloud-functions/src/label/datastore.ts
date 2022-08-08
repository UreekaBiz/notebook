import { CollectionReference } from 'firebase-admin/firestore';

import { LabelIdentifier, LabelNotebook_Storage, LabelPublished_Storage, Label_Storage, NotebookIdentifier, LABELS, LABEL_NOTEBOOK_PUBLISHEDS, LABEL_NOTEBOOKS, LABEL_PUBLISHEDS, LABEL_SUMMARIES } from '@ureeka-notebook/service-common';

import { database, firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: label/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Label -----------------------------------------------------------------------
export const labelCollection = firestore.collection(LABELS) as CollectionReference<Label_Storage>;
export const labelDocument = (labelId: LabelIdentifier) => labelCollection.doc(labelId);

// .. Label Notebook ..............................................................
export const labelNotebookCollection = (labelId: LabelIdentifier) => labelDocument(labelId).collection(LABEL_NOTEBOOKS) as CollectionReference<LabelNotebook_Storage>;
export const labelNotebookDocument = (labelId: LabelIdentifier, notebookId: NotebookIdentifier) => labelNotebookCollection(labelId).doc(notebookId);

// -- Published Label ----------------------------------------------------------
export const labelPublishedCollection = firestore.collection(LABEL_PUBLISHEDS) as CollectionReference<LabelPublished_Storage>;
export const labelPublishedDocument = (labelId: LabelIdentifier) => labelPublishedCollection.doc(labelId);

// .. Label Notebook Published ....................................................
export const labelNotebookPublishedCollection = (labelId: LabelIdentifier) => labelPublishedDocument(labelId).collection(LABEL_NOTEBOOK_PUBLISHEDS) as CollectionReference<LabelNotebook_Storage>;
export const labelNotebookPublishedDocument = (labelId: LabelIdentifier, notebookId: NotebookIdentifier) => labelNotebookPublishedCollection(labelId).doc(notebookId);

// ** RTDB ************************************************************************
// == Collection ==================================================================
// -- Label Summary -------------------------------------------------------------
export const labelSummaryRef = (labelId: LabelIdentifier) => database.ref(`/${LABEL_SUMMARIES}/${labelId}`);

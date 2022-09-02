import { CollectionReference } from 'firebase-admin/firestore';

import { LabelIdentifier, LabelPublished_Storage, Label_Storage, LABELS, LABEL_PUBLISHEDS, nameof } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: label/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Label -----------------------------------------------------------------------
export const labelCollection = firestore.collection(LABELS) as CollectionReference<Label_Storage>;
export const labelDocument = (labelId: LabelIdentifier) => labelCollection.doc(labelId);

// -- Published Label ----------------------------------------------------------
export const labelPublishedCollection = firestore.collection(LABEL_PUBLISHEDS) as CollectionReference<LabelPublished_Storage>;
export const labelPublishedDocument = (labelId: LabelIdentifier) => labelPublishedCollection.doc(labelId);

// === Query ======================================================================
// -- Label -----------------------------------------------------------------------
export const notebookLabelsQuery = (notebookId: string) =>
  labelCollection
    .where(nameof<Label_Storage>('notebookIds'), 'array-contains', notebookId);

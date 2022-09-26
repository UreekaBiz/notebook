import { CollectionReference } from 'firebase-admin/firestore';

import { nameof, Identifier, Version_Storage, VERSIONS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: version/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Version ---------------------------------------------------------------------
export const versionCollection = firestore.collection(VERSIONS) as CollectionReference<Version_Storage>;
export const versionDocument = (id: Identifier) => versionCollection.doc(id);

// === Query ======================================================================
// -- Version ---------------------------------------------------------------------
export const latestVersionQuery =
  versionCollection
    .orderBy(nameof<Version_Storage>('updateTimestamp'), 'desc')
    .limit(1/*last document*/);

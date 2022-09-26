import { collection, doc, limit, orderBy, query, CollectionReference } from 'firebase/firestore';

import { nameof, Identifier, Version_Storage, VERSIONS } from '@ureeka-notebook/service-common';

import { firestore } from '../util/firebase';

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Version ---------------------------------------------------------------------
export const versionCollection = collection(firestore, VERSIONS) as CollectionReference<Version_Storage>;
export const versionDocument = (id: Identifier) => doc(versionCollection, id);

// == Query =======================================================================
// -- Version ---------------------------------------------------------------------
export const latestVersionQuery =
  query(versionCollection, orderBy(nameof<Version_Storage>('updateTimestamp'), 'desc'),
                           limit(1/*last document*/));

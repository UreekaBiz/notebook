import { CollectionReference } from 'firebase-admin/firestore';

import { AssetIdentifier, Asset_Storage, UserIdentifier, ASSETS, ASSET_SUMMARIES } from '@ureeka-notebook/service-common';

import { database, firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: asset/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Asset -----------------------------------------------------------------------
export const assetCollection = firestore.collection(ASSETS) as CollectionReference<Asset_Storage>;
export const assetDocument = (assetId: AssetIdentifier) => assetCollection.doc(assetId);

// ** RTDB ************************************************************************
// == Collection ==================================================================
// -- Asset-User Summary ----------------------------------------------------------
export const assetUserSummaryRef = (userId: UserIdentifier) => database.ref(`/${ASSET_SUMMARIES}/${userId}`);

import { CollectionReference } from 'firebase-admin/firestore';

import { UserIdentifier, UserProfilePublic_Storage, USER_PROFILE_PUBLICS } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: user/datastore.ts

// .. Action Types ................................................................
// SEE: @ureeka-notebook/service-common: user/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- User Profile Public ---------------------------------------------------------
export const userProfilePublicCollection = firestore.collection(USER_PROFILE_PUBLICS) as CollectionReference<UserProfilePublic_Storage>;
export const userProfilePublicDocument = (userId: UserIdentifier) => userProfilePublicCollection.doc(userId);

import { ref, DatabaseReference } from 'firebase/database';
import { collection, doc, orderBy, query, where, CollectionReference, DocumentReference } from 'firebase/firestore';

import { nameof, userKey, userSessionKey, Identifier, SessionIdentifier, UserConfiguration_Storage, UserConfigurationType, UserIdentifier, UserProfilePrivate, CLIENT_CONNECTED, USER_CONFIGURATIONS, USER_PROFILE_PRIVATES, USER_SESSIONS } from '@ureeka-notebook/service-common';

import { database, firestore } from '../util/firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: authUser/datastore.ts

// ================================================================================
// .. Action Types ................................................................
// SEE: @ureeka-notebook/service-common: authUser/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- User Profile Private --------------------------------------------------------
export const userProfilePrivateCollection = collection(firestore, USER_PROFILE_PRIVATES) as CollectionReference<UserProfilePrivate>;
export const userProfilePrivateDocument = (userId: UserIdentifier) => doc(userProfilePrivateCollection, userId);
export const deconstructProfilePrivateRef = (ref: DocumentReference) => {
  // SEE: @ureeka-notebook/service-common: authUser/datastore.ts: USER_PROFILE_PRIVATES
  const privateProfileRef = ref/*for convenience*/;
  const userId = privateProfileRef.id/*document id is the userId*/;
  return { userId };
};

// -- User Configuration ----------------------------------------------------------
export const userConfigurationCollection = <T>(userId: UserIdentifier) =>
  collection(userProfilePrivateDocument(userId), USER_CONFIGURATIONS) as CollectionReference<UserConfiguration_Storage<T>>;
export const userConfigurationDocument = <T>(userId: UserIdentifier, configId: Identifier) =>
  doc(userConfigurationCollection<T>(userId), configId);

// == Query =======================================================================
// -- User Configuration ----------------------------------------------------------
export const userConfigurationsByTypeQuery = <T>(userId: UserIdentifier, type: UserConfigurationType) =>
  query(userConfigurationCollection<T>(userId),
    where(nameof<UserConfiguration_Storage<T>>('type'), '==', type),
    orderBy(nameof<UserConfiguration_Storage<T>>('order'), 'desc'),
    orderBy(nameof<UserConfiguration_Storage<T>>('lastUpdatedBy'), 'desc')/*break ties by lastUpdatedBy*/,
  );

// ** RTDB ************************************************************************
// == Connected ===================================================================
export const clientConnectedRef = ref(database, CLIENT_CONNECTED) as DatabaseReference;

// == User-Session ================================================================
export const userSessionsRef = ref(database, `/${USER_SESSIONS}`);
export const userSessionRef = (userId: UserIdentifier) => ref(database, userKey(userId));
export const sessionDataRef = (userId: UserIdentifier, sessionId: SessionIdentifier) => ref(database, userSessionKey(userId, sessionId));

import { ref, DatabaseReference } from 'firebase/database';
import { collection, doc, CollectionReference, DocumentReference } from 'firebase/firestore';

import { userKey, userSessionKey, SessionIdentifier, UserIdentifier, UserProfilePrivate, CLIENT_CONNECTED, USER_PROFILE_PRIVATES, USER_SESSIONS } from '@ureeka-notebook/service-common';

import { database, firestore } from '../util/firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: authUser/datastore.ts

// ================================================================================
// .. Action Types ................................................................
// SEE: @ureeka-notebook/service-common: authUser/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
export const userProfilePrivateCollection = collection(firestore, USER_PROFILE_PRIVATES) as CollectionReference<UserProfilePrivate>;
export const userProfilePrivateDocument = (userId: UserIdentifier) => doc(userProfilePrivateCollection, userId);
export const deconstructProfilePrivateRef = (ref: DocumentReference) => {
  // SEE: @ureeka-notebook/service-common: authUser/datastore.ts: USER_PROFILE_PRIVATES
  const privateProfileRef = ref/*for convenience*/;
  const userId = privateProfileRef.id/*document id is the userId*/;
  return { userId };
};

// ** RTDB ************************************************************************
// == Connected ===================================================================
export const clientConnectedRef = ref(database, CLIENT_CONNECTED) as DatabaseReference;

// == User-Session ================================================================
export const userSessionsRef = ref(database, `/${USER_SESSIONS}`);
export const userSessionRef = (userId: UserIdentifier) => ref(database, userKey(userId));
export const sessionDataRef = (userId: UserIdentifier, sessionId: SessionIdentifier) => ref(database, userSessionKey(userId, sessionId));

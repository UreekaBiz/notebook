import { CollectionReference } from 'firebase-admin/firestore';

import { nameof, userKey, Identifier, UserConfiguration_Storage, UserIdentifier, UserProfilePrivate_Storage, UserSession_Storage, USER_CONFIGURATIONS, USER_PROFILE_PRIVATES, USER_SESSIONS } from '@ureeka-notebook/service-common';

import { database, firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: authUser/datastore.ts

// .. Action Types ................................................................
// SEE: @ureeka-notebook/service-common: authUser/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- User Profile Private --------------------------------------------------------
export const userProfilePrivateCollection = firestore.collection(USER_PROFILE_PRIVATES) as CollectionReference<UserProfilePrivate_Storage>;
export const userProfilePrivateDocument = (userId: UserIdentifier) => userProfilePrivateCollection.doc(userId);

// -- User Configuration ----------------------------------------------------------
export const userConfigurationCollection = <T>(userId: UserIdentifier) =>
  userProfilePrivateDocument(userId).collection(USER_CONFIGURATIONS) as CollectionReference<UserConfiguration_Storage<T>>;
export const userConfigurationDocument = <T>(userId: UserIdentifier, configId: Identifier) =>
  userConfigurationCollection<T>(userId).doc(configId);

// ** RTDB ************************************************************************
export const userSessionsRef = database.ref(`/${USER_SESSIONS}`);
export const userSessionRef = (userId: UserIdentifier) => database.ref(userKey(userId));

// == Query =======================================================================
// limits the results to only those Users whose oldest Session timestamp is older
// than the max age
// NOTE: this query is bounded on both sides -- UserSessions with no
//       'oldestSessionTimestamp' are not included
// NOTE: 'oldestSessionTimestamp' is computed (bubbled up from the Sessions)
//       *specifically* for this query and in order to limit the number of User-Sessions
//       that are eligible for deletion
export const expiredUserSessionsQuery = (maxAge: number/*millis since epoch*/, maxResults: number) =>
  userSessionsRef.orderByChild(nameof<UserSession_Storage>('oldestSessionTimestamp'))
                 .startAt(0/*oldest possible (specifically so that 'null' entries are considered)*/)
                 .endAt(maxAge)
                 .limitToFirst(maxResults);

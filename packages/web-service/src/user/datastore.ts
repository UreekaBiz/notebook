import { collection, doc, limit, orderBy, query, where, CollectionReference } from 'firebase/firestore';

import { computeUserNamePrefixQueryString, nameof, UserIdentifier, UserProfilePublic_Storage, MAX_USER_SEARCH_RESULTS, USER_PROFILE_PUBLICS } from '@ureeka-notebook/service-common';

import { firestore } from '../util/firebase';

// NOTE: the shortened 'User Profile' naming is used throughout for simplicity
// ** Firestore *******************************************************************
// == Collection ==================================================================
export const userProfileCollection = collection(firestore, USER_PROFILE_PUBLICS) as CollectionReference<UserProfilePublic_Storage>;
export const userProfileDocument = (userId: UserIdentifier) => doc(userProfileCollection, userId);

// == Query =======================================================================
// -- Search ----------------------------------------------------------------------
export const sortedUserProfileQuery =
  query(userProfileCollection, where(nameof<UserProfilePublic_Storage>('deleted'), '==', false/*don't include deleted Users*/),
                               orderBy(nameof<UserProfilePublic_Storage>('sortName'), 'asc'));

// -- Typeahead-find Search -------------------------------------------------------
export const userNamePrefixQuery = (queryString: string) =>
  query(sortedUserProfileQuery, where(nameof<UserProfilePublic_Storage>('searchNamePrefixes'), 'array-contains', computeUserNamePrefixQueryString(queryString)),
                                limit(MAX_USER_SEARCH_RESULTS/*bound for sanity*/));

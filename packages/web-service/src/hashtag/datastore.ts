import { ref } from 'firebase/database';
import { collection, doc, limit, orderBy, query, where, CollectionReference } from 'firebase/firestore';

import { computeHashtagPrefixQueryString, hashString, nameof, normalizeHashtag, Hashtag_Storage, HASHTAGS, HASHTAG_SUMMARIES, MAX_HASHTAG_SEARCH_RESULTS } from '@ureeka-notebook/service-common';

import { database, firestore } from '../util/firebase';

// ********************************************************************************
// == Firestore ===================================================================
// -- Hashtag ---------------------------------------------------------------------
export const hashtagCollection = collection(firestore, HASHTAGS) as CollectionReference<Hashtag_Storage>;
export const hashtagDocument = (hashtag: string) => doc(hashtagCollection, hashString(normalizeHashtag(hashtag)));

// -- Search ----------------------------------------------------------------------
export const sortedHashtagQuery =
  query(hashtagCollection, where(nameof<Hashtag_Storage>('removed'), '==', false/*don't include removed Hashtags*/),
                           orderBy(nameof<Hashtag_Storage>('hashtag'), 'asc'));

// -- Typeahead-find Search -------------------------------------------------------
export const hashtagPrefixQuery = (queryString: string) =>
  query(sortedHashtagQuery, where(nameof<Hashtag_Storage>('searchPrefixes'), 'array-contains', computeHashtagPrefixQueryString(queryString)),
                            limit(MAX_HASHTAG_SEARCH_RESULTS/*bound for sanity*/));

// == RTDB ========================================================================
// -- Hashtag Summary -------------------------------------------------------------
export const hashtagSummary = (hashtag: string) => ref(database, `/${HASHTAG_SUMMARIES}/${normalizeHashtag(hashtag)}`);

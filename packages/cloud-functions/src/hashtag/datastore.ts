import { CollectionReference } from 'firebase-admin/firestore';

import { hashString, normalizeHashtag, Hashtag_Storage, HASHTAG_SUMMARIES, HASHTAGS } from '@ureeka-notebook/service-common';

import { database, firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: hashtag/datastore.ts

// .. Action Types ................................................................
// SEE: @ureeka-notebook/service-common: hashtag/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Hashtag ---------------------------------------------------------------------
export const hashtagCollection = firestore.collection(HASHTAGS) as CollectionReference<Hashtag_Storage>;
export const hashtagDocument = (hashtag: string) => hashtagCollection.doc(hashString(normalizeHashtag(hashtag)));

// ** RTDB ************************************************************************
// -- Hashtag Summary -------------------------------------------------------------
export const hashtagSummary = (hashtag: string) => database.ref(`/${HASHTAG_SUMMARIES}/${normalizeHashtag(hashtag)}`);

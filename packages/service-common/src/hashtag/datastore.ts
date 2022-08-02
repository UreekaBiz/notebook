import { FieldValue } from '../util/firestore';
import { Modify } from '../util/type';
import { Hashtag, HashtagSummary } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// NOTE: use caution when naming since Firestore Indexes are based on collection
//       names and not the full path -- if the collection has the same name then
//       is shares and index!
// REF: https://stackoverflow.com/questions/47151798/cloud-firestore-wildcard-for-indexing/47165007#47165007

// -- Hashtag ---------------------------------------------------------------------
// NOTE: the documentId of a Hashtag is the hash of the normalized hashtag
export const HASHTAGS = 'hashtags'/*top-level collection*/;
export const HASHTAG = `${HASHTAGS}/{hash}` as const/*document (used by CF triggers)*/;

// == RTDB ========================================================================
// -- Hashtag Summary -------------------------------------------------------------
// NOTE: the hashtag key is the normalized hashtag
export const HASHTAG_SUMMARIES = 'hashtag-summaries'/*top-level 'collection'*/;
export const HASHTAG_SUMMARY = `${HASHTAG_SUMMARIES}/{hashtag}` as const/*'collection' (used by CF triggers)*/;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Hashtag ---------------------------------------------------------------------
export type Hashtag_Storage = Hashtag & Readonly<{
  /** in order to support fast prefix (typeahead find) searches, this is the first
   *  #MAX_PREFIX_COUNT normalized prefixes of the normalized hashtag */
  searchPrefixes: string[]/*upper-bounded number of normalized hashtag prefixes*/;
}>;

// == RTDB ========================================================================
// -- Hashtag Summary -------------------------------------------------------------
export type HashtagSummary_Storage = HashtagSummary;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- Hashtag ---------------------------------------------------------------------
export type Hashtag_Create = Modify<Hashtag_Storage, Readonly<{
  removed: false/*can't be removed on create*/;

  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;

export type Hashtag_Update = Partial<Omit<Hashtag_Storage, 'hashtag' | 'searchPrefixes' | 'lastUpdatedBy' | 'updateTimestamp' | 'timestamp'>>
  & Pick<Hashtag_Storage, 'lastUpdatedBy'>/*required*/
  & Modify<Pick<Hashtag_Storage, 'updateTimestamp'>, Readonly<{
      updateTimestamp: FieldValue/*write-on-edit server-side*/;
    }>>;

// == RTDB ========================================================================
// -- Hashtag Summary -------------------------------------------------------------
export type HashtagSummary_Update = HashtagSummary_Storage/*nothing additional*/;

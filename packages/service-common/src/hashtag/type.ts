import { Creatable, Updatable } from '../util/datastore';
import { Identifier } from '../util/type';

// ********************************************************************************
// NOTE: hashtag documentIds are the hash of the normalized hashtag
export type HashtagIdentifier = Identifier;

// --------------------------------------------------------------------------------
export const normalizeHashtag = (hashtag: string) =>
  hashtag.trim()
         .toLocaleLowerCase();

// == Hashtag (Firestore) =========================================================
// the 'ledger' document in Firestore corresponding to the HashtagSummary
// NOTE: this is created by an on-create trigger from when a HashtagSummary is
//       first created
export type Hashtag = Creatable & Updatable & Readonly<{
  /** the normalized hashtag */
  hashtag: string/*write-once server-written*/;

  /** has this hashtag been removed (e.g. for inappropriate content)? */
  // NOTE: this isn't called 'deleted' since a removed Hashtag may be re-added
  // NOTE: this flag is controlled by an Admin
  removed: boolean/*write-(possibly-)many server-written*/;

  // NOTE: createTimestamp is the timestamp when the onCreate trigger from the
  //       corresponding HashtagSummary was executed
}>;

// == Hashtag Summary (RTDB) ======================================================
// SEE: ./datastore.ts: HASHTAG_SUMMARY
export type HashtagSummary = Readonly<{ /*RTDB only*/
  /** the number of occurrences of the Hashtag across all Notebooks. This may be
   *  decremented if a Notebooks is edited and the Hashtag removed. Due to out-of-
   *  order data, it's possible for this value to be negative at any time. These
   *  should be filtered out from an end-user's experience. */
  // NOTE: the naming is specific so as to not be confused with, say, the number
  //       of times that the Hashtag was viewed or clicked on
  occurrence: number/*atomic-increment*/;
}>;

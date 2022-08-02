import { logger } from 'firebase-functions';

import { isType, normalizeHashtag, HashtagSummary_Storage, HashtagSummary_Update } from '@ureeka-notebook/service-common';

import { hashtagSummary } from './datastore';

// ********************************************************************************
// == Occurrence ==================================================================

// NOTE: the specified hashtag will be automatically normalized
export const incrementHashtagOccurrence = async (hashtag: string) =>
  await updateHashtagOccurrence(normalizeHashtag(hashtag), 1)/*logs on error*/;
export const decrementHashtagOccurrence = async (hashtag: string) =>
  await updateHashtagOccurrence(normalizeHashtag(hashtag), -1)/*logs on error*/;

// NOTE: the specified hashtag(s) will be automatically normalized
export const updateHashtagOccurrences = async (added: Set<string> | undefined, removed?: Set<string>) => {
  // ensure correctly normalized hashtags by contract
  if(added)   added   = new Set([...added.values()].map(normalizeHashtag));
  if(removed) removed = new Set([...removed.values()].map(normalizeHashtag));

  if(added)   await Promise.all([...added.values()].map(hashtag =>   updateHashtagOccurrence(hashtag, +1/*increment*/)))/*logs on error*/;
  if(removed) await Promise.all([...removed.values()].map(hashtag => updateHashtagOccurrence(hashtag, -1/*decrement*/)))/*logs on error*/;
};

// --------------------------------------------------------------------------------
type IncrementDecrement = 1 | -1;
const updateHashtagOccurrence = async (hashtag: string, value: IncrementDecrement) => {
  try {
    await hashtagSummary(hashtag).transaction((hashtagSummary: HashtagSummary_Storage | null) => {
      // NOTE: negative values are allowed to account for out-of-order data. Clients
      //       should filter out negative values for a consistent user experience
      const currentValue = (hashtagSummary === null/*either 1st time or cache-miss*/)
                            ? 0/*default*/
                            : hashtagSummary.occurrence;
      return isType<HashtagSummary_Update>({
        occurrence: currentValue + value,
      });
    });
  } catch(error) {
    logger.error(`Error updating RTDB Hashtag Summary (${hashtag}). Reason: `, error);
  }
};

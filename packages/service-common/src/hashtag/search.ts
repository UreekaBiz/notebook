import { createPrefixArray, createSearchPrefix } from '../util/prefix';
import { normalizeHashtag } from './type';

// typeahead-find and prefix-based search are synonyms in all contexts
// ********************************************************************************
export const MAX_HASHTAG_SEARCH_RESULTS = 100/*sane limit on space and time -- can be changed as needed*/;

// --------------------------------------------------------------------------------
export type HashtagSearchResult = string/*hashtag*/;

// == Prefix-based Searches =======================================================
// NOTE: normalizing diacritics to give the best possible chance of matching across
//       character sets
// REF: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const searchNormalizeHashtag = (s: string) => {
  // NOTE: order matters!
  s = normalizeHashtag(s);
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')/*normalize diacritics*/
  s = s.replace(/[\s]/ig, '')/*removes whitespace*/;
  return s.trim();
};

// --------------------------------------------------------------------------------
export const computeHashtagPrefixes = (hashtag: string): string[] =>
  createPrefixArray(searchNormalizeHashtag(hashtag));

// normalizes the specified query for a Hashtag
export const computeHashtagPrefixQueryString = (query: string) =>
  createSearchPrefix(searchNormalizeHashtag(query));

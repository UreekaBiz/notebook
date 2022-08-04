import { createPrefixArray, createSearchPrefix } from '../util/prefix';
import { SearchResult } from '../util/search';
import { LabelIdentifier } from './type';

// typeahead-find and prefix-based search are synonyms in all contexts
// ********************************************************************************
export const MAX_LABEL_SEARCH_RESULTS = 100/*sane limit on space and time -- can be changed as needed*/;

// --------------------------------------------------------------------------------
export type LabelSearchResult = SearchResult<LabelIdentifier, string/*label name*/>;

// == Prefix-based Searches =======================================================
// NOTE: normalizing diacritics to give the best possible chance of matching across
//       character sets
// REF: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const searchNormalizeLabel = (s: string) => {
  // NOTE: order matters!
  s = s.toLocaleLowerCase();
  s = s.replace(/[_-]/g, ' ');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')/*normalize diacritics*/
  s = s.replace(/[^\w]/ig, '')/*also removes whitespace*/;
  return s.trim();
};

// --------------------------------------------------------------------------------
export const generateLabelPrefixes = (hashtag: string): string[] =>
  createPrefixArray(searchNormalizeLabel(hashtag));

// normalizes the specified query for a Label
export const computeLabelPrefixQueryString = (query: string) =>
  createSearchPrefix(searchNormalizeLabel(query));

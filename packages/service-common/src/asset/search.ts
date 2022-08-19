import { createPrefixArray, createSearchPrefix } from '../util/prefix';
import { SearchResult } from '../util/search';
import { normalizeAsset, AssetIdentifier } from './type';

// typeahead-find and prefix-based search are synonyms in all contexts
// ********************************************************************************
export const MAX_ASSET_SEARCH_RESULTS = 100/*sane limit on space and time -- can be changed as needed*/;

// --------------------------------------------------------------------------------
export type AssetSearchResult = SearchResult<AssetIdentifier, string/*Asset name*/>;

// ================================================================================
// computes the Asset's name as it is used in sorting
// CHECK: would removing whitespace and/or diacritics improve the sort results?
export const computeAssetSortName = (name: string): string =>
  normalizeAsset(name).toLocaleLowerCase();

// == Prefix-based Searches =======================================================
// NOTE: normalizing diacritics to give the best possible chance of matching across
//       character sets
// REF: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const searchNormalizeAsset = (s: string) => {
  // NOTE: order matters!
  s = s.toLocaleLowerCase();
  s = s.replace(/[_-]/g, ' ');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')/*normalize diacritics*/;
  s = s.replace(/[^\w]/ig, '')/*also removes whitespace*/;
  return s.trim();
};

// --------------------------------------------------------------------------------
export const computeAssetPrefixes = (hashtag: string): string[] =>
  createPrefixArray(searchNormalizeAsset(hashtag));

// normalizes the specified query for a Asset
export const computeAssetPrefixQueryString = (query: string) =>
  createSearchPrefix(searchNormalizeAsset(query));

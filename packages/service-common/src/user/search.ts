import { createPrefixArray, createSearchPrefix } from '../util/prefix';
import { SearchResult } from '../util/search';
import { isBlank } from '../util/string';
import { UserIdentifier } from '../util/user';

// typeahead-find and prefix-based search are synonyms in all contexts
// ********************************************************************************
export const MAX_USER_SEARCH_RESULTS = 100/*sane limit on space and time -- can be changed as needed*/;

// --------------------------------------------------------------------------------
export type UserSearchResult = SearchResult<UserIdentifier, string/*user name*/>;

// ================================================================================

// computes the User's name as it is used in sorting
// CHECK: should this normalize as well?
export const computeUserSortName = (firstName?: string, lastName?: string): string => {
  firstName = (firstName || '').trim().toLocaleLowerCase()/*consistency*/;
  lastName = (lastName || '').trim().toLocaleLowerCase()/*consistency*/;

  const blankFirst = isBlank(firstName),
        blankLast = isBlank(lastName);
  if(blankFirst && blankLast) return '';
  if(blankFirst) return lastName;
  if(blankLast) return firstName;
  return `${firstName} ${lastName}`;
};

// == Prefix-based Searches =======================================================
// NOTE: currently normalizing diacritics to give the best possible chance of
//       matching across character sets
// REF: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const normalizeUserPrefixString = (s: string) => {
  // NOTE: order matters!
  s = s.toLocaleLowerCase();
  s = s.replace(/[_-]/g, ' ');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')/*normalize diacritics*/
  s = s.replace(/[^\w]/ig, '')/*also removes whitespace*/;
  return s.trim();
};

// --------------------------------------------------------------------------------
// NOTE: this includes both first-last and last-first combinations to provide the
//       best chance of matching on User input
export const computeUserNamePrefixes = (firstName?: string, lastName?: string): string[] => {
  // if there is either a first or last name then only one set of prefixes is needed
  // CHECK: should this do combinations for every space for more complex names?
  const sortName = computeUserSortName(firstName, lastName);
  if(sortName.indexOf(' ') < 0) return createPrefixArray(normalizeUserPrefixString(sortName));
  return [...createPrefixArray(normalizeUserPrefixString(sortName)),
          ...createPrefixArray(normalizeUserPrefixString(computeUserSortName(lastName, firstName)))];
};

// normalizes the specified query for a User prefix-search
export const computeUserNamePrefixQueryString = (query: string) =>
  createSearchPrefix(normalizeUserPrefixString(query));

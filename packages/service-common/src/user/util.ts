import { ObjectTuple } from '../util/datastore';
import { createApplicationError } from '../util/error';
import { Comparator } from '../util/predicate';
import { UserIdentifier } from '../util/user';
import { UserProfilePublic_Storage } from './datastore';

// ********************************************************************************
// == Comparator ==================================================================
export const userProfileComparator: Comparator<ObjectTuple<UserIdentifier, UserProfilePublic_Storage>> = (a, b) => {
  // the same document identifier is an equal document by contract
  // NOTE: all Firestore document ids are guaranteed to be universally unique
  if(a.id === b.id) return 0/*equal*/;

  // sort based on the 'sortOrder' ('asc') by contract
  if(a.obj.sortName < b.obj.sortName) return -1/*'a' before 'b'*/;
  if(a.obj.sortName > b.obj.sortName) return +1/*'a' after 'b'*/;

  // same sortName so lexicographically order by id ('asc')
  if(a.id > b.id) return +1/*'a' after 'b'*/;
  if(a.id < b.id) return -1/*'a' before 'b'*/;
  throw createApplicationError('devel/unhandled', `Faulty User Profile Public comparator (${a.id}; ${b.id})`)/*already checked for equals above!*/;
};

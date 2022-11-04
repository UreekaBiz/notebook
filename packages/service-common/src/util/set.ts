// convenience methods for working with sets
// ********************************************************************************
/** @returns `true` if all entries from set 'a' are present in set 'b' */
export const setEquals = <T>(a: Set<T>, b: Set<T>): boolean => {
  if(a.size !== b.size) return false/*cannot be equal if different sizes*/;

  // NOTE: uses 'for' instead of 'forEach' for performance
  for(const key of a) {
    if(!b.has(key)) return false/*differs -- early exit*/;
  }

  return true/*all entries match*/;
};

/** @returns the set of values that exist in `previous` that do not exist in `final`.
 *           If there are no values that have been removed in `final` then an *empty*
 *           set is returned. Additional values in `final` that do not appear in
 *           `previous` (i.e. 'new values') are *not* reported. */
export const differenceSet = <T>(previous: Set<T>, final: Set<T>): Set<T> => {
  if(final.size < 1) return new Set(previous)/*clone*/;
  const result = new Set<T>();
    previous.forEach(e => { if(!final.has(e)) result.add(e); });
  return result;
};

/** @returns the set of all values from both sets */
export const unionSet = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const result = new Set(a);
    b.forEach(e => result.add(e));
  return result;
};

/** @returns the set of values that exist within both sets */
export const intersectionSet = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const result = new Set<T>();
    a.forEach(e => { if(b.has(e)) result.add(e); });
  return result;
};

/** @returns `true` if and only if there is an element in `list` that is in `set` */
export const listOverlapsSet = <T>(list: T[], set: Set<T>) => {
  for(let element of list) if(set.has(element)) return true/*by contract*/;
  return false/*by contract*/;
};

// == Changes =====================================================================
export type SetChange<T> = Readonly<{
  added: Set<T>;
  removed: Set<T>;
  unchanged: Set<T>;
}>;

/** @returns a {@link SetChange} that describes the values that have been 1) added
 *          to Set `final` that don't exist in Set `previous`, 2) removed from Set
 *          `previous` and  don't exist in Set `final`) and 3) unchanged between
 *          the specified sets */
export const setChange = <T>(previous: Set<T>, final: Set<T>): SetChange<T> =>
  ({
    added: differenceSet(final, previous),
    removed: differenceSet(previous, final),
    unchanged: intersectionSet(previous, final),
  });

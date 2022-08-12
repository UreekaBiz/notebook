// convenience methods for working with arrays
// ********************************************************************************
// REF: https://github.com/tc39/proposal-array-from-async
export const fromAsync = async <T>(iterator: AsyncIterable<T>): Promise<T[]> => {
  const result: T[] = [];
  for await (const item of iterator) {
    result.push(item);
  }
  return result;
};

// ================================================================================
// deduplicates the specified array while preserving order. Elements found earlier
// in the array are preferred over elements found later in the array
export const deduplicate = <T>(array: T[]) => {
  const set = new Set<T>();
  return array.filter(item => {
    if(set.has(item)) {
      return false/*exclude*/;
    } else { /*doesn't already exist*/
      set.add(item);
      return true/*include*/;
    }
  });
};

// --------------------------------------------------------------------------------
// returns an array of values that exist in `previous` that do not exist in `final`.
// If there are no values that have been removed in `final` then an *empty* array
// is returned. Additional values in `final` that do not appear in `previous` (i.e.
// 'new values') are *not* reported. The order of the two input arrays is irrelevant
// and no assumptions can be made about the order of the resulting array. The
// returned array is always a new array. Shallow copies of the arrays are made. If
// there are duplicate values in `previous` that aren't in `final` then each duplicate
// will be present in the resulting array.
export const difference = <T>(previous: T[], final: T[]): T[] => {
  if(final.length < 1) return previous.slice()/*clone*/;
  const lookup = new Set(final);
  const result: T[] = []/*initially empty*/;
    previous.forEach(e => { if(!lookup.has(e)) result.push(e); });
  return result;
};

// returns an array of values that is the intersection of A of B (i.e. the set of
// values contained in both A and B). The returned array is always a new array.
// Shallow copies of the arrays are made. If there are duplicate values in A that
// are contained in B then those duplicate values will be present in the resulting
// array. (Duplicate values in B are irrelevant.)
// SEE: https://en.wikipedia.org/wiki/Complement_(set_theory)#Relative_complement
export const intersection = <T>(a: T[], b: T[]): T[] => {
  const lookup = new Set(b);
  const result: T[] = []/*initially empty*/;
    a.forEach(e => { if(lookup.has(e)) result.push(e); });
  return result;
};

// --------------------------------------------------------------------------------
// returns `true` if and only if there is an element in A that is in B
export const setOverlapsSet = <T>(a: Set<T>, b: Set<T>) => {
  for(let element of a.values()) if(b.has(element)) return true/*by contract*/;
  return false/*by contract*/;
};

// ================================================================================
export const groupBy = <I, T>(array: T[], key: (value: T) => I[] | I): Map<I, T[]> => {
  const map = new Map<I, T[]>();
  const addElement = (element: T, keyValue: I) => {
    let values = map.get(keyValue);
    if(values === undefined) map.set(keyValue, (values = []));
    values.push(element);
  };

  array.forEach(element => {
    const keyValue = key(element);
    if(Array.isArray(keyValue)) keyValue.forEach(keyValue => addElement(element, keyValue));
    else addElement(element, keyValue);
  });

  return map;
};

// the specified array *must* be already ordered by the grouped-by dimension (i.e.
// the value of key()). No order is guaranteed for the grouped values
export const orderedGroupBy = <I, T>(array: T[], key: (v: T) => I[] | I): [I, T[]][] => {
  const result: [I, T[]][] = [];

  let lastKeyValue: I | undefined/*none set*/ = undefined/*by default none set*/;
  let elements: T[] = []/*elements for the last key-value*/;
  const addElement = (element: T, keyValue: I) => {
    if(keyValue !== lastKeyValue) {
      result.push([keyValue, elements = []])/*store since new key-value*/;
      lastKeyValue = keyValue/*new key-value*/;
    } /* else -- same key-value */
    elements.push(element);
  };

  array.forEach(element => {
    const keyValue = key(element);
    if(Array.isArray(keyValue)) keyValue.forEach(keyValue => addElement(element, keyValue));
    else addElement(element, keyValue);
  });

  return result;
};

// ================================================================================
// splits an array into chunks (arrays) of specified size
export const splitIntoChunks = <T>(array: T[], length: number): T[][] => {
  const result: T[][] = [];
  for(let i=0; i<array.length; i+=length)
    result.push(array.slice(i, i + length));
  return result;
};

// --------------------------------------------------------------------------------
// Swaps two elements from in array *in place*
export const swap = (array: any[], swappedFrom: number, swappedTo: number) => {
  const tmp = array[swappedFrom];
  array[swappedFrom] = array[swappedTo];
  array[swappedTo] = tmp;
};

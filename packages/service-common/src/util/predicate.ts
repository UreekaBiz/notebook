import { ObjectTuple  } from './datastore';
import { Timestamp } from './firestore';

// convenience functions for predicates (e.g. Array's filter())
// ********************************************************************************

// == Comparators =================================================================
export type Comparator<T> = (a: T, b: T) => number/*a<b|-1; a=b|0; a>b|1*/;

export const NumberComparator = (a: number, b: number) => a - b;/*ascending*/
export const StringComparator = (a: string, b: string) => a.localeCompare(b);
       const IntlComparator = new Intl.Collator([], { numeric: true }).compare/*sort string-numbers as numbers*/;
export const StringNumberComparator = (a: string, b: string) => IntlComparator(a, b);

// REF: https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp#valueof
export const TimestampComparator = (a: Timestamp, b: Timestamp) => {
  const aValue = a.valueOf(),
        bValue = b.valueOf();
  if(aValue < bValue) return -1;
  if(aValue > bValue) return 1;
  return 0;
};

// == Filters =====================================================================
// REF: https://github.com/microsoft/TypeScript/issues/16069
export const isPresent = <T>(t : T | undefined | null | void): t is T => t !== undefined && t != null;
export const isDefined = <T>(t : T | undefined): t is T => t !== undefined;
export const isNotNull = <T>(t : T | null): t is T => t != null;

// for ObjectTuples
export const isTuplePresent = <I, T>(t : ObjectTuple<I, T | undefined | null | void>): t is ObjectTuple<I, T> => t.obj !== undefined && t.obj != null;
export const isTupleDefined = <I, T>(t : ObjectTuple<I, T | undefined>): t is ObjectTuple<I, T> => t.obj !== undefined;
export const isTupleNotNull = <I, T>(t : ObjectTuple<I, T | null>): t is ObjectTuple<I, T> => t.obj != null;

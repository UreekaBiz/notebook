import { orderBy, query, DocumentData, DocumentReference, FieldValue, OrderByDirection, Query } from 'firebase/firestore';
export { OrderByDirection } from 'firebase/firestore';

import { isType, Identifier, ObjectTuple } from '@ureeka-notebook/service-common';

// ** Query / Filter / Sort *******************************************************
// NOTE: when adding new sort fields don't forget to also update isOrderByDirection.
export type FilterSort<SortField> = Readonly<{
  /** the field being sorted on */
  field: SortField | FieldValue/*for FieldPath.documentId()*/;

  /** the sort order / direction */
  direction: OrderByDirection;
}>;
export type SortableFilter<SortField extends string> = Readonly<{ sort?: FilterSort<SortField>[]; }>;

// CHECK: Is there a better way to do this?
export const isOrderByDirection = (value: any): value is OrderByDirection => value === 'asc' || value === 'desc';

// ................................................................................
export const buildSortQuery = <T, SortField extends string>(buildQuery: Query<T>, filter: SortableFilter<SortField>, defaultSortField?: SortField) => {
  // REF: https://firebase.google.com/docs/firestore/query-data/order-limit-data
  const sort: FilterSort<SortField>[] = [];
  if(filter.sort && (filter.sort.length > 0))
    sort.push(...filter.sort);
  else if(defaultSortField) /*sort not specified so use defaults (if provided)*/
    sort.push({ field: defaultSortField, direction: 'asc' }/*default by contract*/);
  /* else -- sort and default not specified */

  return sort.reduce((sortQuery, sort) => query(sortQuery, orderBy(sort.field, sort.direction)), buildQuery);
};

// ** Observable ******************************************************************
// == Objects =====================================================================
// TODO: these don't need 'ref' since 'ref' is only used for 'id' in the Tuple case!

export type Converter<F extends DocumentData, T> = (ref: DocumentReference<F>, data: F) => T;
export const defaultConverter = <T>(ref: DocumentReference<T>, data: T) => data;

export type DocumentConverter<F extends DocumentData, T> = (ref: DocumentReference<F>, data: F | undefined/*not found or not accessible*/) => T;
export const defaultDocumentConverter = <T>(ref: DocumentReference<T>, data: T | undefined/*not found or not accessible*/): T | null/*none*/ =>
  (data === undefined) ? null/*not found or not accessible*/ : data;

// == Tuples ======================================================================
export type TupleConverter<I, F extends DocumentData, T> = (ref: DocumentReference<F>, data: F) =>
  ObjectTuple<I, T>;
export const defaultTupleConverter = <T>(ref: DocumentReference<T>, data: T) =>
  isType<ObjectTuple<Identifier, T>>({ id: ref.id, obj: data });

export type DocumentTupleConverter<I, F extends DocumentData, T> = (ref: DocumentReference<F>, data: F | undefined/*not found or not accessible*/) =>
  ObjectTuple<I, T>;
export const defaultDocumentTupleConverter = <T>(ref: DocumentReference<T>, data: T | undefined/*not found or not accessible*/) =>
  isType<ObjectTuple<Identifier, T | null/*none*/>>({ id: ref.id, obj: (data === undefined) ? null/*not found or not accessible*/ : data });

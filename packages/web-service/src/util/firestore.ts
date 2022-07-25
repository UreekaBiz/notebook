import { DocumentData, DocumentReference } from 'firebase/firestore';

import { isType, Identifier, ObjectTuple } from '@ureeka-notebook/service-common';

// ********************************************************************************

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

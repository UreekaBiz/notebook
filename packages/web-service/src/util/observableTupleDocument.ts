import { DocumentReference, DocumentSnapshot } from 'firebase/firestore';
import { catchError, map, of, Observable } from 'rxjs';

import { ObjectTuple } from '@ureeka-notebook/service-common';

import { DocumentTupleConverter } from './firestore';
import { documentSnapshot, documentSnapshotOnce } from './observableDocument';

// ********************************************************************************
// == DocumentRef => Observable Tuple =============================================
export const documentTuple = <I, T, R = T>(ref: DocumentReference<T>, tupleConverter: DocumentTupleConverter<I, T, R>): Observable<ObjectTuple<I, R>> =>
  observableTuple(ref, documentSnapshot(ref), tupleConverter);

export const documentTupleOnce = <I, T, R = T>(ref: DocumentReference<T>, tupleConverter: DocumentTupleConverter<I, T, R>): Observable<ObjectTuple<I, R>> =>
  observableTuple(ref, documentSnapshotOnce(ref), tupleConverter);

// --------------------------------------------------------------------------------
const snapshotToTuple = <I, T, R>(snapshot: DocumentSnapshot<T>, tupleConverter: DocumentTupleConverter<I, T, R>): ObjectTuple<I, R> =>
  tupleConverter(snapshot.ref, snapshot.data());

// ................................................................................
const observableTuple = <I, T, R = T>(ref: DocumentReference<T>, observable: Observable<DocumentSnapshot<T>>, tupleConverter: DocumentTupleConverter<I, T, R>): Observable<ObjectTuple<I, R>> =>
  observable.pipe(
    map(snapshot => snapshotToTuple(snapshot, tupleConverter)),
    catchError(() => of(tupleConverter(ref, undefined/*no data - by contract*/)))
  );

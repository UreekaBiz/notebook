import { DocumentData, DocumentReference, DocumentSnapshot } from 'firebase/firestore';
import { map, Observable } from 'rxjs';

import { DocumentConverter } from './firestore';
import { fromDocumentRef, fromDocumentRefOnce } from './observableFirestore';

// ********************************************************************************

// == DocumentRef => Observable Snapshot ==========================================
export const documentSnapshot = <T = DocumentData>(ref: DocumentReference<T>): Observable<DocumentSnapshot<T>> =>
  fromDocumentRef(ref)/*alias*/;

export const documentSnapshotOnce = <T = DocumentData>(ref: DocumentReference<T>): Observable<DocumentSnapshot<T>> =>
  fromDocumentRefOnce(ref)/*alias*/;

// == DocumentRef => Observable Object ============================================
const snapshotToObject = <T, R>(snapshot: DocumentSnapshot<T>, tupleConverter: DocumentConverter<T, R>): R =>
  tupleConverter(snapshot.ref, snapshot.data());

// ................................................................................
export const document = <T, R>(ref: DocumentReference<T>, tupleConverter: DocumentConverter<T, R>): Observable<R> =>
  documentSnapshot(ref).pipe(map(snapshot => snapshotToObject(snapshot, tupleConverter)));

export const documentOnce = <T, R>(ref: DocumentReference<T>, tupleConverter: DocumentConverter<T, R>): Observable<R> =>
  documentSnapshotOnce(ref).pipe(map(snapshot => snapshotToObject(snapshot, tupleConverter)));

import { getDoc, getDocs, onSnapshot, DocumentData, DocumentReference, DocumentSnapshot, Query, QuerySnapshot, SnapshotListenOptions } from 'firebase/firestore';
import { from, Observable, Unsubscribable } from 'rxjs';

import { isType } from '@ureeka-notebook/service-common';

// ********************************************************************************

// == Query => Observable =========================================================
export const fromQuery = <T = DocumentData>(query: Query<T>, options?: SnapshotListenOptions): Observable<QuerySnapshot<T>> =>
  new Observable(subscriber => isType<Unsubscribable>({ unsubscribe: onSnapshot(query, options || {}/*none*/, subscriber) }));

export const fromQueryOnce = <T = DocumentData>(query: Query<T>): Observable<QuerySnapshot<T>> =>
  from(getDocs(query));

// == CollectionRef => Observable =================================================
// NOTE: these use 'Query' as it's a sub-type of Collection for convenience
export const fromCollectionRef = <T = DocumentData>(query: Query<T>, options?: SnapshotListenOptions): Observable<QuerySnapshot<T>> =>
  fromQuery(query, options)/*alias*/;

export const fromCollectionRefOnce = <T = DocumentData>(query: Query<T>): Observable<QuerySnapshot<T>> =>
  fromQueryOnce(query)/*alias*/;

// == DocumentRef => Observable ===================================================
export const fromDocumentRef = <T = DocumentData>(ref: DocumentReference<T>, options?: SnapshotListenOptions): Observable<DocumentSnapshot<T>> =>
  new Observable(subscriber => isType<Unsubscribable>({ unsubscribe: onSnapshot(ref, options || {}/*none*/, subscriber) }));

export const fromDocumentRefOnce = <T = DocumentData>(ref: DocumentReference<T>): Observable<DocumentSnapshot<T>> =>
  from(getDoc(ref));

import { DocumentChange, DocumentData, Query, QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { fromQuery, fromQueryOnce } from './observableFirestore';

// ********************************************************************************

// == Query => Observable Snapshot ================================================
export const querySnapshots = <T = DocumentData>(query: Query<T>): Observable<QueryDocumentSnapshot<T>[]> =>
  observableSnapshots(fromQuery(query));
export const observableSnapshots = <T = DocumentData>(observable: Observable<QuerySnapshot<T>>): Observable<QueryDocumentSnapshot<T>[]> =>
  observable.pipe(map(snapshot => snapshot.docs));

export const querySnapshotsOnce = <T = DocumentData>(query: Query<T>): Observable<QueryDocumentSnapshot<T>[]> =>
  observableSnapshotsOnce(fromQueryOnce(query));
export const observableSnapshotsOnce = <T = DocumentData>(observable: Observable<QuerySnapshot<T>>): Observable<QueryDocumentSnapshot<T>[]> =>
  observable.pipe(map(snapshot => snapshot.docs));

export const queryCollectionChanges = <T = DocumentData>(query: Query<T>): Observable<DocumentChange<T>[]> =>
  collectionChanges(fromQuery(query));
export const collectionChanges = <T = DocumentData>(observable: Observable<QuerySnapshot<T>>): Observable<DocumentChange<T>[]> =>
  observable.pipe(map(snapshot => snapshot.docChanges()));

import { refEqual, DocumentChange, DocumentData, DocumentReference, Query, QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { of, Observable } from 'rxjs';
import { distinctUntilChanged, map, scan } from 'rxjs/operators';

import { ObjectTuple } from '@ureeka-notebook/service-common';

import { TupleConverter } from './firestore';
import { queryCollectionChanges, querySnapshotsOnce } from './observableCollection';

// ********************************************************************************
// == Snapshot => Observable Tuple ================================================
export const snapshotTuplesOnce = <F extends DocumentData, I, T>(snapshot: QuerySnapshot<F>, tupleConverter: TupleConverter<I, F, T>): Observable<ObjectTuple<I, T>[]> =>
  of(snapshot.docs.map(snapshot => snapshotToTuple(snapshot, tupleConverter)));

// == Query => Observable Tuple ===================================================
export const queryTuples = <F extends DocumentData, I, T>(query: Query<F>, tupleConverter: TupleConverter<I, F, T>): Observable<ObjectTuple<I, T>[]> =>
  observableTuples(queryCollectionChanges(query), tupleConverter);
export const observableTuples = <F extends DocumentData, I, T>(observable: Observable<DocumentChange<F>[]>, tupleConverter: TupleConverter<I, F, T>): Observable<ObjectTuple<I, T>[]> =>
  observable.pipe(
    scan((accumulator: RefObjectTuple<F, I, T>[], current: DocumentChange<F>[]) => processDocumentChanges(accumulator, current, tupleConverter), []),
    distinctUntilChanged()
  );

export const queryTuplesOnce = <F extends DocumentData, I, T>(query: Query<F>, tupleConverter: TupleConverter<I, F, T>): Observable<ObjectTuple<I, T>[]> =>
  collectionTuplesOnce(querySnapshotsOnce(query), tupleConverter);
export const collectionTuplesOnce = <F extends DocumentData, I, T>(observable: Observable<QueryDocumentSnapshot<F>[]>, tupleConverter: TupleConverter<I, F, T>): Observable<ObjectTuple<I, T>[]> =>
  observable.pipe(map(snapshots => snapshots.map(snapshot => snapshotToTuple(snapshot, tupleConverter))));

// ================================================================================
// to allow for comparisons against the DocumentReference in #processDocumentChange()
// internally this type is used (and decorates the ObjectTuple)
type RefObjectTuple<F extends DocumentData, I, T> = {
  readonly ref: DocumentReference<F>;
} & ObjectTuple<I, T>;

// --------------------------------------------------------------------------------
const processDocumentChanges = <F extends DocumentData, I, T>(existing: RefObjectTuple<F, I, T>[], changes: DocumentChange<F>[], tupleConverter: TupleConverter<I, F, T>): RefObjectTuple<F, I, T>[] => {
  const results = existing.slice()/*clone*/;
    changes.forEach(change => processDocumentChange(results, change, tupleConverter));
  return results;
};

const processDocumentChange = <F extends DocumentData, I, T>(combined: RefObjectTuple<F, I, T>[], change: DocumentChange<F>, tupleConverter: TupleConverter<I, F, T>): RefObjectTuple<F, I, T>[] => {
  const tuple = documentChangeToTuple(change, tupleConverter);

  // REF: https://github.com/FirebaseExtended/rxfire/blob/main/firestore/collection/index.ts
  switch(change.type) {
    case 'added': {
      if((combined[change.newIndex] === undefined) || !refEqual(combined[change.newIndex].ref, change.doc.ref)) {
        combined.splice(change.newIndex, 0/*add at new location*/, tuple);
      } else { /*something exists at newIndex and it's the same reference*/
        // NOTE: this case occurs with RxJS operators such as combineLatest() where
        //       the same change might be processed again due to another dependency
        ///      changing
        combined[change.newIndex] = tuple;
      }
      break;
    }

    case 'modified': {
      if((combined[change.oldIndex] === undefined) || refEqual(combined[change.oldIndex].ref, change.doc.ref)) {
        if(change.oldIndex !== change.newIndex) {
          combined.splice(change.oldIndex, 1/*remove at old location*/);
          combined.splice(change.newIndex, 0/*add at new location*/, tuple);
        } else { /*same index*/
          combined.splice(change.newIndex, 1/*remove*/, tuple);
        }
      } else { /*something exists at oldIndex and it's a different reference*/
        combined[change.newIndex] = tuple;
      }
      break;
    }

    case 'removed': {
      if((combined[change.oldIndex] !== undefined) && refEqual(combined[change.oldIndex].ref, change.doc.ref)) {
        combined.splice(change.oldIndex, 1/*remove*/);
      } /* else -- nothing at the old index or it's a difference reference */
      // NOTE: nothing is done with the 'else' case since it would be removing
      //       a value that has already been removed (which means that the index
      //       would remove a different value which would be incorrect!)
      break;
    }

    default:
      console.error(`Unknown Firestore Snapshot ChangeType '${change.type}'. Ignoring.`);
      break;
  }

  return combined;
};

// --------------------------------------------------------------------------------
const documentChangeToTuple = <F extends DocumentData, I, T>(change: DocumentChange<F>, tupleConverter: TupleConverter<I, F, T>): RefObjectTuple<F, I, T> =>
  snapshotToTuple(change.doc, tupleConverter);
const snapshotToTuple = <F extends DocumentData, I, T>(snapshot: QueryDocumentSnapshot<F>, tupleConverter: TupleConverter<I, F, T>): RefObjectTuple<F, I, T> =>
  ({ ...tupleConverter(snapshot.ref, snapshot.data()), ref: snapshot.ref });

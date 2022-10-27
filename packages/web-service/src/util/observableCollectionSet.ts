import { DocumentChange, Query, QueryDocumentSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';

import { getLogger, ServiceLogger } from '../logging';
import { queryCollectionChanges } from './observableCollection';

const log = getLogger(ServiceLogger.UTIL);

// SEE: observableCollectionMap.ts
// ********************************************************************************
// a projection (as in relational algebra) operations
export type ProjectOperation<T, R> = (snapshot: QueryDocumentSnapshot<T>) => R;
export const defaultProject = <T>(snapshot: QueryDocumentSnapshot<T>): T => snapshot.data();

// ================================================================================
export const querySet = <T, R>(query: Query<T>, project: ProjectOperation<T, R>): Observable<Set<R>> =>
  collectionSet(queryCollectionChanges(query), project);
export const collectionSet = <T, R>(observable: Observable<DocumentChange<T>[]>, project: ProjectOperation<T, R>): Observable<Set<R>> =>
  observable.pipe(
    scan((accumulator: Set<R>, current: DocumentChange<T>[]) => processDocumentChanges(accumulator, current, project), new Set<R>())
  );

// --------------------------------------------------------------------------------
const processDocumentChanges = <T, R>(existing: Set<R>, changes: DocumentChange<T>[], project: ProjectOperation<T, R>): Set<R> =>
  changes.reduce((_, change) => processDocumentChange(existing, change, project), existing);

const processDocumentChange = <T, R>(result: Set<R>, change: DocumentChange<T>, project: ProjectOperation<T, R>): Set<R> => {
  // NOTE: ignores duplicate or unexpected changes
  // REF: https://github.com/firebase/firebase-js-sdk/blob/master/packages/rxfire/firestore/collection/index.ts
  const value = project(change.doc);
  switch(change.type) {
    case 'added'/*fall-through*/:
    case 'modified':
      result.add(value);
      break;

    case 'removed':
      result.delete(value);
      break;

    default:
      log.error(`Unhandled Firestore snapshot change type '${change.type}' in Observable query-based set. Ignoring.`);
      break;
  }
  return result;
};

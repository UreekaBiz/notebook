import { DocumentChange, Query, QueryDocumentSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';

import { getLogger, ServiceLogger } from '../logging';
import { queryCollectionChanges } from './observableCollection';

const log = getLogger(ServiceLogger.UTIL);

// SEE: observableCollectionSet.ts
// ********************************************************************************
// a projection (as in relational algebra) operations
export type ProjectOperation<I, F, T> = (snapshot: QueryDocumentSnapshot<F>) => [I, T];

// ================================================================================
export const queryMap = <I, F, T>(query: Query<F>, project: ProjectOperation<I, F, T>): Observable<Map<I, T>> =>
  collectionMap(queryCollectionChanges(query), project);
export const collectionMap = <I, F, T>(observable: Observable<DocumentChange<F>[]>, project: ProjectOperation<I, F, T>): Observable<Map<I, T>> =>
  observable.pipe(
    scan((accumulator: Map<I, T>, current: DocumentChange<F>[]) => processDocumentChanges(accumulator, current, project), new Map<I, T>()),
  );

// --------------------------------------------------------------------------------
const processDocumentChanges = <I, F, T>(existing: Map<I, T>, changes: DocumentChange<F>[], project: ProjectOperation<I, F, T>): Map<I, T> =>
  changes.reduce((_, change) => processDocumentChange(existing, change, project), existing);

const processDocumentChange = <I, F, T>(result: Map<I, T>, change: DocumentChange<F>, project: ProjectOperation<I, F, T>): Map<I, T> => {
  // NOTE: ignores duplicate or unexpected changes
  // REF: https://github.com/firebase/firebase-js-sdk/blob/master/packages/rxfire/firestore/collection/index.ts
  const tuple = project(change.doc);
  switch(change.type) {
    case 'added'/*fall-through*/:
    case 'modified':
      result.set(tuple[0], tuple[1]);
      break;

    case 'removed':
      result.delete(tuple[0]);
      break;

    default:
      log.error(`Unhandled Firestore snapshot change type '${change.type}' in Observable query-based map. Ignoring.`);
      break;
  }
  return result;
};

import { get, off, onValue, DatabaseReference, DataSnapshot, Query } from 'firebase/database';
import { from, Observable, Unsubscribable } from 'rxjs';

import { isType } from '@ureeka-notebook/service-common';

// ********************************************************************************
export type DatabaseTuple = Readonly<{
  snapshot: DataSnapshot;
  previousKey?: string | null;
}>;

// ================================================================================
export type ObjectConverter<T> = (snapshot: DataSnapshot) => T;
export type ObjectCollectionConverter<T> = (snapshot: DataSnapshot) => T[];

// ********************************************************************************
// NOTE: currently only supports 'value' events
export const fromQuery = (query: Query, eventType: 'value'/*EventType*/): Observable<DatabaseTuple> =>
  new Observable(subscriber => {
    const callback = onValue(query,
      (snapshot: DataSnapshot, previousKey?: string | null) => subscriber.next({ snapshot, previousKey }),
      (error: Error) => subscriber.error(error),
    );
    return isType<Unsubscribable>({ unsubscribe: () => off(query, eventType, callback) });
  });

// ................................................................................
// converts a Database Reference into a stream of Observables
// NOTE: currently only supports 'value' events
export const fromObjectRef = (ref: DatabaseReference, eventType: 'value'/*EventType*/): Observable<DatabaseTuple> =>
  fromQuery(ref, eventType)/*alias*/;

export const fromObjectRefOnce = (ref: DatabaseReference): Observable<DataSnapshot> =>
  from(get(ref));

import { DatabaseReference, DataSnapshot } from 'firebase/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DatabaseTuple, fromObjectRef, fromObjectRefOnce, ObjectConverter } from './observableRtdb';

// ********************************************************************************
// == Reference => Observable Snapshot ============================================
export const objectSnapshot = (ref: DatabaseReference): Observable<DatabaseTuple> =>
  fromObjectRef(ref, 'value')/*alias*/;

export const objectSnapshotOnce = (ref: DatabaseReference): Observable<DataSnapshot> =>
  fromObjectRefOnce(ref)/*alias*/;

// == Reference => Object =========================================================
export const object = <T>(ref: DatabaseReference, objectConverter: ObjectConverter<T>): Observable<T> =>
  objectSnapshot(ref).pipe(map(({ snapshot }) => objectConverter(snapshot)));

import { Query } from 'firebase/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { fromQuery, ObjectCollectionConverter } from './observableRtdb';

// ********************************************************************************
// == Query => Observable Collection ==============================================
export const objectCollection = <T>(query: Query, objectCollectionConverter: ObjectCollectionConverter<T>): Observable<T[]> =>
  fromQuery(query, 'value').pipe(map(({ snapshot }) => objectCollectionConverter(snapshot)));

import { iif, of, switchMap } from 'rxjs';

import { defaultVersion } from '@ureeka-notebook/service-common';

import { defaultTupleConverter } from '../util/firestore';
import { queryTuples } from '../util/observableTupleCollection';
import { latestVersionQuery } from './datastore';

// ********************************************************************************
// == Version =====================================================================
// -- Latest ----------------------------------------------------------------------
export const latestVersion$ = () =>
  queryTuples(latestVersionQuery, defaultTupleConverter)
    .pipe(
      switchMap(tuples =>
        iif(() => tuples.length < 1/*incorrectly configured system*/,
        of(defaultVersion/*not a great answer, but fits the contract*/),
        of(tuples[0/*only one by definition*/].obj)
      )
    ));

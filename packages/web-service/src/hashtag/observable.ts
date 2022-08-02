import { map } from 'rxjs/operators';

import { isType, HashtagSearchResult } from '@ureeka-notebook/service-common';

import { querySnapshotsOnce } from '../util/observableCollection';
import { hashtagPrefixQuery } from './datastore';

// ********************************************************************************
// == Typeahead-find Search =======================================================
export const typeaheadFindHashtags$ = (query: string) =>
  querySnapshotsOnce(hashtagPrefixQuery(query))
    .pipe(map(snapshots =>
      snapshots.map(snapshot =>
        isType<HashtagSearchResult>(snapshot.data().hashtag)
      )
    ));

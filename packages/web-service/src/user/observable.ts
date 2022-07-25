import { UserIdentifier } from '@ureeka-notebook/service-common';

import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { documentOnce } from '../util/observableDocument';
import { queryTuplesOnce } from '../util/observableTupleCollection';
import { documentTuple } from '../util/observableTupleDocument';
import { userNamePrefixQuery, userProfileDocument } from './datastore';

// ********************************************************************************
// == Get =========================================================================
export const userProfileOnceById$ = (userId: UserIdentifier) =>
  documentOnce(userProfileDocument(userId), defaultDocumentConverter);
export const userProfileById$ = (userId: UserIdentifier) =>
  documentTuple(userProfileDocument(userId), defaultDocumentTupleConverter);

// == Typeahead-find Search =======================================================
export const typeaheadFindProfiles$ = (query: string) =>
  queryTuplesOnce(userNamePrefixQuery(query), defaultTupleConverter);

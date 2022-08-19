import { AssetIdentifier, Asset_Storage, AssetTuple, UserIdentifier } from '@ureeka-notebook/service-common';

import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { QueryObservable, QuerySnapshotObservable } from '../util/observableCollection';
import { documentOnce } from '../util/observableDocument';
import { queryTuples, snapshotTuplesOnce } from '../util/observableTupleCollection';
import { documentTuple } from '../util/observableTupleDocument';
import { assetDocument, assetQuery } from './datastore';
import { AssetFilter } from './type';

// ********************************************************************************
// == Asset =======================================================================
// -- Get -------------------------------------------------------------------------
export const assetOnceById$ = (assetId: AssetIdentifier) =>
  documentOnce(assetDocument(assetId), defaultDocumentConverter);
export const assetById$ = (assetId: AssetIdentifier) =>
  documentTuple(assetDocument(assetId), defaultDocumentTupleConverter);

// .. Pagination ..................................................................
export const assetSnapshotObservable$: QuerySnapshotObservable<Asset_Storage, AssetTuple> =
  snapshot => snapshotTuplesOnce(snapshot, defaultTupleConverter);

// -- Search ----------------------------------------------------------------------
export const assetsQuery$: QueryObservable<Asset_Storage, AssetTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const assets$ = (userId: UserIdentifier, filter: AssetFilter) =>
  queryTuples(assetQuery(userId, filter), defaultTupleConverter);

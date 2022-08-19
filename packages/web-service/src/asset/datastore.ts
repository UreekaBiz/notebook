import { ref } from 'firebase/database';
import { collection, doc, limit, orderBy, query, where, CollectionReference, Query } from 'firebase/firestore';

import { computeAssetPrefixQueryString, isBlank, nameof, AssetIdentifier, Asset_Storage, UserIdentifier, ASSETS, ASSET_SUMMARIES, MAX_ASSET_SEARCH_RESULTS } from '@ureeka-notebook/service-common';

import { database, firestore } from '../util/firebase';
import { buildSortQuery } from '../util/firestore';
import { AssetFilter } from './type';

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Asset -----------------------------------------------------------------------
export const assetCollection = collection(firestore, ASSETS) as CollectionReference<Asset_Storage>;
export const assetDocument = (assetId: AssetIdentifier) => doc(assetCollection, assetId);

// ................................................................................
export const generateAssetId = () => doc(assetCollection).id/*generates a new document id*/;

// == Query =======================================================================
// -- Asset -----------------------------------------------------------------------
export const assetQuery = (userId: UserIdentifier, filter: AssetFilter) => {
  let buildQuery = assetCollection as Query<Asset_Storage>;

  // must be the owner / creator of the Asset
  buildQuery = query(buildQuery, where(nameof<Asset_Storage>('createdBy'), '==', userId));

  // filter
  if(!isBlank(filter.name)) {
    // TODO: support substring!!
    buildQuery = query(buildQuery, where(nameof<Asset_Storage>('name'), '==', filter.name!));
  } /* else -- 'name' was not specified in the filter */

  // sort
  buildQuery = buildSortQuery(buildQuery, filter, nameof<Asset_Storage>('sortName')/*default sort field*/);

  return buildQuery;
};

// .. Search ......................................................................
export const sortedAssetQuery = (userId: UserIdentifier) =>
  query(assetCollection, where(nameof<Asset_Storage>('createdBy'), '==', userId),
                         orderBy(nameof<Asset_Storage>('name'), 'asc'));

// .. Typeahead-find Search .......................................................
export const assetPrefixQuery = (userId: UserIdentifier, queryString: string) =>
  query(sortedAssetQuery(userId), where(nameof<Asset_Storage>('searchNamePrefixes'), 'array-contains', computeAssetPrefixQueryString(queryString)),
                                  limit(MAX_ASSET_SEARCH_RESULTS/*bound for sanity*/));

// ** RTDB ************************************************************************
// == Collection ==================================================================
// -- Asset-User Summary ----------------------------------------------------------
export const assetUserSummary = (userId: UserIdentifier, assetId: AssetIdentifier) =>
  ref(database, `/${ASSET_SUMMARIES}/${userId}/${assetId}`);

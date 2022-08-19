import { FieldValue } from '../util/firestore';
import { Modify, UnionType } from '../util/type';
import { Asset, AssetUserSummary } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// -- Asset -----------------------------------------------------------------------
export const ASSETS = 'assets'/*top-level collection*/;
export const ASSET = `${ASSETS}/{assetId}` as const/*document (used by CF triggers)*/;

// == RTDB ========================================================================
// -- Asset Summary ---------------------------------------------------------------
// the key is the Asset Identifier
export const ASSET_SUMMARIES = 'asset-summaries'/*top-level 'collection'*/;
export const ASSET_USER_SUMMARY = `${ASSET_SUMMARIES}/{userId}`/*'document'*/;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Asset -----------------------------------------------------------------------
export type Asset_Storage = Asset/*nothing additional*/;

// == RTDB ========================================================================
// -- Asset User-Summary ----------------------------------------------------------
export type AssetUserSummary_Storage = AssetUserSummary/*nothing additional*/;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- Asset -----------------------------------------------------------------------
export type Asset_Create = Modify<Asset_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
export type Asset_Update =
    Partial<UnionType<Pick<Asset_Storage, 'name' | 'description' | 'searchNamePrefixes' | 'sortName'>, FieldValue/*deletable*/>>
  & Modify<Pick<Asset_Storage, 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
      updateTimestamp: FieldValue/*always-write server-set*/;
    }>>;
// NOTE: hard-delete so no delete Action Type

// == RTDB ========================================================================
// -- Asset User-Summary ----------------------------------------------------------
export type AssetUserSummary_Update = Modify<AssetUserSummary_Storage, Readonly<{
  count: Object/*sentinel value for atomic Increment / Decrement*/;
  byteCount: Object/*sentinel value for atomic Increment / Decrement*/;
}>>;

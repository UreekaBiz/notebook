import { isBlank } from '../util/string';
import { UserIdentifier } from '../util/user';
import { AssetIdentifier } from './type';

// paths to Assets stored in the default Firebase GCS bucket: STORAGE_BUCKET
// ********************************************************************************
export const ASSET_STORAGE_PATH = 'a'/*for 'Asset'*/;

// format: /a/{userId}/{assetId}
export const ASSET_PATH_REGEXP = new RegExp(`^${ASSET_STORAGE_PATH}\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)$`);

// ================================================================================
export const generateAssetPath = (userId: UserIdentifier, assetId: AssetIdentifier) =>
  `${ASSET_STORAGE_PATH}/${userId}/${assetId}`;

// --------------------------------------------------------------------------------
export const extractAssetId = (name?: string): Readonly<{ userId: UserIdentifier; assetId: AssetIdentifier; }> | undefined/*not an Asset*/ => {
  if(isBlank(name)) return undefined/*not an Asset*/;

  const match = name!.match(ASSET_PATH_REGEXP);
  if(!match || (match.length !== 3)) return undefined/*not an Asset*/;
  return { userId: match[/*$*/1], assetId: match[/*$*/2] };
};

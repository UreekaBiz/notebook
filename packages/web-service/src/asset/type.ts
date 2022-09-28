import { Asset, AssetDelete_Rest, AssetDelete_Rest_Schema, AssetUpdate_Rest, AssetUpdate_Rest_Schema } from '@ureeka-notebook/service-common';

import { SortableFilter } from '../util/firestore';

// ** Firebase ********************************************************************
// purely for convenience
export {
  getBlob,
  getBytes,
  getDownloadURL,
  getMetadata,
} from 'firebase/storage';

// ** RXJS ********************************************************************
// purely for convenience
export { lastValueFrom } from 'rxjs';

// ** Service-Common **************************************************************
export {
  // SEE: @ureeka-notebook/service-common: asset/type.ts
  Asset,
  AssetIdentifier,
  AssetTuple,
  AssetType,
  AssetUserSummary,

  // SEE: @ureeka-notebook/service-common: asset/search.ts
  AssetSearchResult,
} from '@ureeka-notebook/service-common';

// ********************************************************************************
// == Asset =======================================================================
// -- Update / Delete -------------------------------------------------------------
// NOTE: Assets are automatically created when they're uploaded to GCS

export const Asset_Update_Schema = AssetUpdate_Rest_Schema;
export type Asset_Update = AssetUpdate_Rest;

export const Asset_Delete_Schema = AssetDelete_Rest_Schema;
export type Asset_Delete = AssetDelete_Rest;

// == Search ======================================================================
// -- Asset -----------------------------------------------------------------------
export type AssetSortField = keyof Pick<Asset,
  | 'name'
  | 'type'
  | 'createTimestamp'
  | 'createdBy'
>;

/** the resulting query is the 'AND' of each member but the 'OR' of any multi-valued
 *  filter */
export type AssetFilter = SortableFilter<AssetSortField> & Readonly<{
  // NOTE: this supports only *exact* *match*
  name?: string;
}>;

import { logger } from 'firebase-functions';

import { AssetUserSummary_Update, UserIdentifier } from '@ureeka-notebook/service-common';

import { DatabaseIncrement } from '../util/rtdb';
import { assetUserSummaryRef } from './datastore';

// TODO: make this per-Notebook (specifically, so that Notebooks know how many AssetUsers
//       are associated with them)
// ********************************************************************************
// == Create ======================================================================
// NOTE: the summary is not explicitly created -- it's simply incremented below

// == Update ======================================================================
// used to both increase (when a new Asset is created) and decrease (when an Asset
// is deleted)
export const updateAssetUserSummary = async (userId: UserIdentifier, countIncrement: number, byteCountIncrement: number) => {
  try {
    // NOTE: each will start at 0 if not already present
    const update: AssetUserSummary_Update = {
      count: DatabaseIncrement(countIncrement),
      byteCount: DatabaseIncrement(byteCountIncrement),
    };
    await assetUserSummaryRef(userId).update(update);
  } catch(error) {
    // NOTE: doesn't throw by design
    logger.error(`Error updating RTDB Asset User-Summary for User (${userId}). Reason: `, error);
  }
};

// == Delete ======================================================================
// NOTE: this is only Used when a *User* is deleted (not an Asset)
export const deleteAssetUserSummary = async (userId: UserIdentifier) => {
  try {
    await assetUserSummaryRef(userId).remove();
  } catch(error) {
    // NOTE: doesn't throw by design
    logger.error(`Error deleting RTDB Asset User-Summary for User (${userId}). Reason: `, error);
  }
};

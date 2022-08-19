import * as functions from 'firebase-functions';

import { AssetDelete_Rest, AssetDelete_Rest_Schema, AssetUpdate_Rest, AssetUpdate_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall } from '../util/function';
import { deleteAsset, updateAsset } from './asset';

// ********************************************************************************
// == Asset ====================================================================
// NOTE: Assets are automatically created when they're uploaded to GCS
// SEE: ./onStorage.ts

// ................................................................................
export const assetUpdate = functions.https.onCall(wrapCall<AssetUpdate_Rest>(
{ name: 'assetUpdate', schema: AssetUpdate_Rest_Schema, convertNullToUndefined: false/*explicitly not*/, requiresAuth: true },
async (data, context, userId) => {
  await updateAsset(userId!/*auth'd*/, data.assetId, data.name, data.description);
}));

// ................................................................................
export const assetDelete = functions.https.onCall(wrapCall<AssetDelete_Rest>(
{ name: 'assetDelete', schema: AssetDelete_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  await deleteAsset(userId!/*auth'd*/, data.assetId);
}));

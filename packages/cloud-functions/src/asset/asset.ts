import { DocumentReference } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { computeAssetPrefixes, computeAssetSortName, isBlank, removeUndefined, AssetIdentifier, AssetType, Asset_Create, Asset_Storage, Asset_Update, SystemUserId, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { DeleteField, ServerTimestamp } from '../util/firestore';
import { updateAssetUserSummary } from './assetUserSummary';
import { assetCollection, assetDocument } from './datastore';

// ********************************************************************************
// == Create ======================================================================
export const createAsset = async (
  userId: UserIdentifier, assetId: AssetIdentifier,
  contentType: string, url: string, sizeInBytes: number
): Promise<AssetIdentifier> => {
  const assetRef = assetCollection.doc(/*create new*/) as DocumentReference<Asset_Create>;
  try {
    const asset: Asset_Create = {
      type: AssetType.Image/*FIXME: hardcoded -- derive from contentType*/,
      sizeInBytes,

      url,

      // NOTE: name and description (and the search fields) are only on update

      createdBy: userId,
      createTimestamp: ServerTimestamp/*by contract*/,
      lastUpdatedBy: userId,
      updateTimestamp: ServerTimestamp/*by contract*/,
    };
    await assetRef.create(asset)/*create by definition*/;
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error creating new Asset for User (${userId}). Reason: `, error);
  }
  logger.info(`Created new Asset (userId:${userId}; assetId:${assetId}; size:${sizeInBytes}; contentType:${contentType}; url:${url}) from uploaded content for User (${userId}).`);

  await updateAssetUserSummary(userId, +1/*Asset added*/, sizeInBytes)/*logs on error*/;

  return assetId;
};

// == Update ======================================================================
export const updateAsset = async (
  userId: UserIdentifier,
  assetId: AssetIdentifier,
  name: string | null/*specified but no value*/ | undefined/*not specified*/, description: string | null/*specified but no value*/ | undefined/*not specified*/
) => {
  try {
    const assetRef = assetDocument(assetId) as DocumentReference<Asset_Update>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(assetRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot update non-existing Asset (${assetId}) for User (${userId}).`);
      const existingAsset = snapshot.data()! as Asset_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the User specifically to
      //        be able to check if the User is also an Admin
      if(existingAsset.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot update Asset (${assetId}) not created by User (${userId}).`);

      const asset: Asset_Update = {
        name: (name === null/*specified but no value*/) ? DeleteField : name,
        description: (description === null/*specified but no value*/) ? DeleteField : description,

        sortName: isBlank(name) ? undefined/*removed below*/ : computeAssetSortName(name!),
        searchNamePrefixes: isBlank(name) ? undefined/*removed below*/ : computeAssetPrefixes(name!),

        lastUpdatedBy: SystemUserId/*by contract*/,
        updateTimestamp: ServerTimestamp/*server-written*/,
      };
      transaction.update(assetRef, removeUndefined(asset));
    });

    // NOTE: Asset User-Summary does not change for Asset updates (only Asset Creation / Deletion)
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating Asset (${assetId}) for User (${userId}). Reason: `, error);
  }
};

// == Delete ======================================================================
export const deleteAsset = async (userId: UserIdentifier, assetId: AssetIdentifier) => {
  let sizeInBytes: number;
  try {
    const assetRef = assetDocument(assetId);
    sizeInBytes = await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(assetRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot delete non-existing Asset (${assetId}) for User (${userId}).`);
      const existingAsset = snapshot.data()! as Asset_Storage/*by definition*/;
      // FIXME: push down the ability to check the roles of the user specifically to
      //        be able to check if the User is also an admin
      if(existingAsset.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Cannot delete Asset (${assetId}) not created by User (${userId}).`);

      transaction.delete(assetRef);

      return existingAsset.sizeInBytes;
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error deleting Asset (${assetId}) for User (${userId}). Reason: `, error);
  }

  await updateAssetUserSummary(userId, -1/*Asset removed*/, -sizeInBytes)/*logs on error*/;
};

import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';

import { extractAssetId, isBlank } from '@ureeka-notebook/service-common';

import { STORAGE_BUCKET } from '../util/environment';
import { wrapOnFinalize } from '../util/function';
import { createAsset } from './asset';

// ********************************************************************************
// when an Asset is uploaded to GCS, a matching entry is made in Firestore and RTDB
// NOTE: *all* writes to the default storage bucket (including 'directories') trigger
//       this function!!!
export const onStorageAssetCreate = functions.storage.bucket(STORAGE_BUCKET).object().onFinalize(wrapOnFinalize(async object => {
  const extract = extractAssetId(object.name);
  if(!extract) return/*not an Asset so not applicable*/;

  if(!object.contentType) { logger.warn(`Asset (${object.name}) created but has no content-type. Not going to create a Firebase Asset for it.`); return/*not a valid Asset so not applicable*/; }
  if(!isBlank(object.mediaLink)) { logger.warn(`Asset (${object.name}) created but has no media link. Not going to create a Firebase Asset for it.`); return/*not a valid Asset so not applicable*/; }
  await createAsset(extract.userId, extract.assetId, object.contentType, object.mediaLink!, Number(object.size));
}));

// TODO: onDelete which deletes from Firestore and RTDB

import { ref, uploadBytesResumable, UploadTaskSnapshot } from 'firebase/storage';
import { Observable } from 'rxjs';

import { generateAssetPath, isBlank, UserIdentifier } from '@ureeka-notebook/service-common';

import { getEnv } from '../util/environment';
import { storage } from '../util/firebase';
import { fromUploadTask } from '../util/observableStorage';
import { generateAssetId } from './datastore';

// ********************************************************************************
const CACHE_CONTROL = getEnv('NEXT_PUBLIC_ASSET_CACHE_CONTROL');

// ********************************************************************************
export const assetUpload$ = (userId: UserIdentifier, data: Blob | Uint8Array | ArrayBuffer): Observable<UploadTaskSnapshot> => {
  const assetRef = ref(storage, generateAssetPath(userId, generateAssetId()));

  const cacheControl = isBlank(CACHE_CONTROL) ? undefined/*none*/ : { cacheControl: CACHE_CONTROL };
  const uploadTask = uploadBytesResumable(assetRef, data, cacheControl);

  return fromUploadTask(uploadTask);
};

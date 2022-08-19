import { httpsCallable } from 'firebase/functions';

import { AssetDelete_Rest, AssetUpdate_Rest } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { wrapHttpsCallable } from '../util/function';

// ** Auth'd User *****************************************************************
// == Asset =======================================================================
export const assetUpdate = wrapHttpsCallable<AssetUpdate_Rest>(httpsCallable(functions, 'assetUpdate'));
export const assetDelete = wrapHttpsCallable<AssetDelete_Rest>(httpsCallable(functions, 'assetDelete'));

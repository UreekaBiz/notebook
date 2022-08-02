import * as functions from 'firebase-functions';

import { AdminHashtagRemoveUpdate_Rest, AdminHashtagRemoveUpdate_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall, SmallMemory } from '../util/function';
import { updateHashtag } from './hashtag';

// ********************************************************************************
// == Admin =======================================================================
// allows an Admin to update the 'remove' flag on the specified Hashtag
export const adminHashtagRemoveUpdate = functions.runWith(SmallMemory).https.onCall(wrapCall<AdminHashtagRemoveUpdate_Rest>(
{ name: 'adminHashtagRemoveUpdate', schema: AdminHashtagRemoveUpdate_Rest_Schema, requiresAdmin: true/*by contract*/ },
async (data, context, userId) => {
  await updateHashtag(userId!/*admin*/, data.hashtag, data.remove);
}));

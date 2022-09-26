import * as functions from 'firebase-functions';

import { VersionWrite_Rest, VersionWrite_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall } from '../util/function';
import { writeVersion } from './version';

// ** Admin-Only ******************************************************************
// == Version =====================================================================
export const versionWrite = functions.https.onCall(wrapCall<VersionWrite_Rest>(
{ name: 'versionWrite', schema: VersionWrite_Rest_Schema, convertNullToUndefined: false/*explicitly not*/, requiresAdmin: true/*by contract*/ },
async (data, context, userId) => {
  await writeVersion(userId!/*auth'd*/, data.web);
}));

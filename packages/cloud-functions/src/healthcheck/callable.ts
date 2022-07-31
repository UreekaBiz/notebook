import * as functions from 'firebase-functions';

import { HealthcheckResult } from '@ureeka-notebook/service-common';

import { LongrunningRuntimeOpts, wrapRequest } from '../util/function';
import { doHealthcheck } from './healthcheck';

// ********************************************************************************
export const healthcheck = functions.runWith(LongrunningRuntimeOpts).https.onRequest(wrapRequest<object/*none*/, HealthcheckResult>(
{ name: 'healthcheck', requiresAuth: false/*public*/ },
async () => {
  return await doHealthcheck();
}));

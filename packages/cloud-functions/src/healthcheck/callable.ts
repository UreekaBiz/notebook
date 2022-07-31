import { RuntimeOptions } from 'firebase-functions';
import * as functions from 'firebase-functions';

import { HealthcheckResult } from '@ureeka-notebook/service-common';

import { wrapRequest } from '../util/function';
import { doHealthcheck } from './healthcheck';

// ********************************************************************************
// a vanilla HTTPS Cloud Function that checks the health (by explicitly calling)
// all configured HTTPS Cloud Functions and returns the aggregate results
const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 120/*s*/,
};
export const healthcheck = functions.runWith(runtimeOpts).https.onRequest(wrapRequest<object/*none*/, HealthcheckResult>(
{ name: 'healthcheck', requiresAuth: false/*public*/ },
async () => {
  return await doHealthcheck();
}));

import * as functions from 'firebase-functions';

import { ClientLog_Rest, ClientLog_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall, SmallMemory } from '../util/function';
import { logReportedError } from './logging';

// ********************************************************************************
// log the specified ClientLog to Stackdriver Logging -- specifically into the
// 'Reported Errors' view
// NOTE: auth is explicitly not required to allow for logging in cases before the
//       user is logged in.
export const loggingClient = functions.runWith(SmallMemory).https.onCall(wrapCall<ClientLog_Rest>(
{ name: 'loggingClient', schema: ClientLog_Rest_Schema, requiresAuth: false/*see NOTE*/ },
async (data) => {
  // NOTE: no auth *does* open this up to attacks. The only mitigation in place
  //       is checking for a known input format
  await logReportedError(data);
}));
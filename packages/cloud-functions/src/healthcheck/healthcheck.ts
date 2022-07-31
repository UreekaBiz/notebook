import { logger } from 'firebase-functions';
import fetch, { Response } from 'node-fetch';

import { difference, HealthcheckResult, HealthcheckStatus, VersionResponse_Schema, VERSION_REQUEST } from '@ureeka-notebook/service-common';

import { getFunctionDomain, validateData } from '../util/function';

// TODO: wrap this in a build-time function that automatically generates the list
//       of functions
// ********************************************************************************
// the set of endpoints (Cloud Functions) that do not follow the convention of
// returning a VersionResponse when probed
const excludedEndpointNames = [
  'healthcheck'/*ensures no circular dependency*/,

  // Firestore and RTDB triggers
  'onCreateFirebaseUser',
  'onCreateJournalVersion',
  'onWriteUserProfilePrivate',
  'onWriteUserSessionUser',

  // Scheduled Tasks
  'scheduleFirestoreExport',
  'scheduleUserSessionExpiration',

  // Cloud Task HTTPS targets
  // (currently none)
];

// the set of all endpoints (Cloud Functions) that are to be health checked
const endpointNames = [
  // NOTE: this *CANNOT* include 'healthcheck' so that there is no circular dependency
  // SEE: #excludedEndpointNames()

  'authUserSessionClear',
  'authUserSessionHeartbeat',
  'authUserSessionUpdate',
  'authUserUserPrivateProfileUpdate',
  'journalCreate',
  'journalDelete',
  'journalShare',
  'loggingClient',
  'publishedJournalCreate',
];

// ================================================================================
export const doHealthcheck = async (): Promise<HealthcheckResult> => {
  const healthcheckEndpointNames = difference(endpointNames, excludedEndpointNames)/*remove excluded*/;
  const statuses = await Promise.all(healthcheckEndpointNames.map(name => healthcheckCallable(name)));

  // NOTE: this currently only checks for failed health checks. It does not ensure
  //       the versions are consistent, etc.
  const failed = statuses.filter(status => !status.result);
  if(failed.length > 0) return { success: false/*failed*/, statuses: failed };
  return { success: true/*success*/, statuses };
};

// ................................................................................
const healthcheckCallable = async (name: string): Promise<HealthcheckStatus> => {
  const startTime = Date.now();

  let response: Response | undefined;
  let responseBody: any/*intentional*/ = {}/*none by default*/;
  try {
    // TODO: implement a timeout! (REF: https://davidwalsh.name/fetch-timeout)
    const url = `https://${getFunctionDomain()}/${name}`;
    const body = { 'data': { [VERSION_REQUEST]: true } }/*'data' wrapper required by HTTPS CFs*/;
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow'/*shouldn't redirect but just in case, follow it*/,
      body: JSON.stringify(body),
    });
    responseBody = await response.json()/*format is {'result': ...}*/;
  } catch(error) {
    logger.error(`Network error from HTTPS Cloud Function '${name}'. Reason: `, error);
    try { if(response) logger.error(await response.text())/*NOTE: most errors are due to the fact that the response isn't JSON*/; } catch(error) { /*ignore*/ }
    return { name, result: false/*failed*/ };
  }

  const endTime = Date.now();
  const elapsedTime = endTime - startTime;

  if(response.ok && ('result' in responseBody)) {
    try {
      validateData(responseBody.result, VersionResponse_Schema);
      return {
        name,
        elapsedTime,
        ...responseBody,
      }
    } catch(error) {
      logger.error(`Invalid response body from HTTPS Cloud Function '${name}'. Reason: `, error);
      return { name, result: false/*failed*/ };
    }
  } else { /*POST failed*/
    logger.error(`Unsuccessful / invalid response from HTTPS Cloud Function '${name}'. Reason: ${response.statusText}`);
    return { name, result: false/*failed*/ };
  }
};

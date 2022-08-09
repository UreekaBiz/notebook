import { logger } from 'firebase-functions';
import axios, { AxiosResponse } from 'axios';

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
  'onCreateHashtagSummary',
  'onCreateNotebookVersion',
  'onWriteUserProfilePrivate',
  'onWriteUserSessionUser',

  // Scheduled Tasks
  'scheduleFirestoreExport',
  'scheduleUserSessionExpiration',

  // Cloud Task HTTPS targets
  'targetMigration',
  'targetNotebookShareBatchNotification',
];

// the set of all endpoints (Cloud Functions) that are to be health checked
const endpointNames = [
  // NOTE: this *CANNOT* include 'healthcheck' so that there is no circular dependency
  // SEE: #excludedEndpointNames()

  'adminHashtagRemoveUpdate',

  'authUserSessionClear',
  'authUserSessionHeartbeat',
  'authUserSessionUpdate',
  'authUserUserPrivateProfileUpdate',

  'labelCreate',
  'labelDelete',
  'labelNotebookAdd',
  'labelNotebookRemove',
  'labelNotebookReorder',
  'labelShare',
  'labelUpdate',

  'notebookCreate',
  'notebookDelete',
  'notebookPublish',
  'notebookShare',

  'notebookEditorInsertText',

  'loggingClient',
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

  let response: AxiosResponse;
  try {
    const url = `https://${getFunctionDomain()}/${name}`;
    response = await axios(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { 'data': { [VERSION_REQUEST]: true } }/*'data' wrapper required by HTTPS CFs*/,
      // TODO: implement a timeout!
    });
  } catch(error) {
    logger.error(`Network error from HTTPS Cloud Function '${name}'. Reason: `, error);
    return { name, result: false/*failed*/ };
  }

  const endTime = Date.now();
  const elapsedTime = endTime - startTime;

  if(response.status !== 200/*OK*/) {
    try {
      validateData(response.data, VersionResponse_Schema);
      return {
        name,
        elapsedTime,
        ...response.data,
      };
    } catch(error) {
      logger.error(`Invalid response body from HTTPS Cloud Function '${name}'. Reason: `, error);
      return { name, result: false/*failed*/ };
    }
  } else { /*POST failed*/
    logger.error(`Unsuccessful / invalid response from HTTPS Cloud Function '${name}'. Reason: ${response.statusText}`);
    return { name, result: false/*failed*/ };
  }
};

import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';

import { wrapRequest, MaintenanceRuntimeOpts } from '../util/function';
import { ShareBatchNotification_Rest, ShareBatchNotification_Rest_Schema } from './function';

// ********************************************************************************
// Task target HTTPS Cloud Functions. Access must be explicitly restricted (since
// otherwise they will be public) via:
//  gcloud functions remove-iam-policy-binding <function_name> \
//    --project='<project_id>' \
//    --region='us-central1' \
//    --member='allUsers' \
//    --role='roles/cloudfunctions.invoker'
//  gcloud functions add-iam-policy-binding <function_name> \
//    --project='<project_id>' \
//    --region='us-central1' \
//    --member='serviceAccount:<project_id>@appspot.gserviceaccount.com' \
//    --role='roles/cloudfunctions.invoker'
// REF: https://cloud.google.com/functions/docs/securing/managing-access
// ********************************************************************************

// ================================================================================
//  gcloud tasks create-http-task \
//    --project='<project_id>' \
//    --queue='BatchDispatchNotification' \
//    --oidc-service-account-email='<project_id>@appspot.gserviceaccount.com' \
//    --url='https://<region>-<project_id>.cloudfunctions.net/targetNotebookShareBatchNotification' \
//    --header='Content-Type: application/json' \
//    --method='POST' \
//    --body-content='{
//          "notebookId":<notebook_id>,
//          "userIds":<JSON array of UserIdentifiers>}'
export const TARGET_NOTEBOOK_SHARE_BATCH_NOTIFICATION = 'targetNotebookShareBatchNotification'/*used to enqueue in Cloud Task*/;
export const targetNotebookShareBatchNotification = functions.runWith(MaintenanceRuntimeOpts).https.onRequest(wrapRequest<ShareBatchNotification_Rest>(
{ name: TARGET_NOTEBOOK_SHARE_BATCH_NOTIFICATION, schema: ShareBatchNotification_Rest_Schema },
async (data) => {
  // TODO: flesh this out!!!
  logger.info(`Stub to batch share Notebook (${data.notebookId}) with Users (${JSON.stringify(data.userIds)}).`);
}));

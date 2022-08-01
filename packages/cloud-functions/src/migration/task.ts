import * as functions from 'firebase-functions';

import { ApplicationError } from '../util/error';
import { wrapRequest, MaintenanceRuntimeOpts } from '../util/function';
import { exampleNotebookAddFieldMigration, exampleNotebookRemoveFieldMigration } from './example';
import { Migrate_Rest, Migrate_Rest_Schema } from './function';
import { migrateTask } from './migrate';
import { MigrationKey, MigrationTask } from './type';

// ********************************************************************************
// Task target HTTPS Cloud Functions. Access must be explicitly restricted (since
// otherwise they will be public) via:
//  gcloud functions remove-iam-policy-binding <function_name> \
//    --project='<project_id>' \
//    --region='us-central1' \
//    --member='allUsers' \
//    --role='roles/cloudfunctions.invoker'
//  gcloud functions add-iam-policy-binding targetMigration \
//    --project='<project_id>' \
//    --region='us-central1' \
//    --member='serviceAccount:<project_id>@appspot.gserviceaccount.com' \
//    --role='roles/cloudfunctions.invoker'
// REF: https://cloud.google.com/functions/docs/securing/managing-access
// ********************************************************************************

// ================================================================================
// NOTE: there were problems with circular deps when this was done statically
let _migrationTask: { [name in MigrationKey]: MigrationTask<any> } | undefined/*un-initialized*/ = undefined/*not initialized*/;
const migrationTask = () => {
  if(_migrationTask !== undefined) return _migrationTask/*already lazy-init'd*/;
  return _migrationTask = {
    [MigrationKey.ExampleNotebookAddField]: exampleNotebookAddFieldMigration,
    [MigrationKey.ExampleNotebookRemoveField]: exampleNotebookRemoveFieldMigration,
  };
};

// ================================================================================
// entry point for all migration tasks
//  gcloud tasks create-http-task \
//    --project='<project_id>' \
//    --queue='SystemMaintenance' \
//    --oidc-service-account-email='<project_id>@appspot.gserviceaccount.com' \
//    --url='https://<region>-<project_id>.cloudfunctions.net/targetMigration' \
//    --header='Content-Type: application/json' \
//    --method='POST' \
//    --body-content='{
//          "key":<migration_key>}'
export const MIGRATE_FUNCTION = 'targetMigration'/*needed to enqueue in Cloud Task*/;
export const targetMigration = functions.runWith(MaintenanceRuntimeOpts).https.onRequest(wrapRequest<Migrate_Rest>(
{ name: MIGRATE_FUNCTION, schema: Migrate_Rest_Schema },
async (data) => {
  const task = migrationTask()[data.key];
  if(task === undefined) throw new ApplicationError('devel/unhandled', `Unknown migration task '${data.key}'.`);

  await migrateTask(data.key, task.query, task.migrate);
}));

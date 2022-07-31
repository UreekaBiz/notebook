import * as firestore from '@google-cloud/firestore';
import { google } from '@google-cloud/firestore/build/protos/firestore_admin_v1_proto_api'
import { logger } from 'firebase-functions';

import { convertNullToUndefined, isBlank } from '@ureeka-notebook/service-common';

import { getEnv, PROJECT_ID } from '../util/environment';
import { ApplicationError } from '../util/error';

// ********************************************************************************
type ConfigInfo = Readonly<{
  bucket: string;
  collections: string[];
}>;
const configInfo = ((): ConfigInfo | null/*not configured*/ => {
  const FIRESTORE_EXPORT_BUCKET = getEnv('FIRESTORE_EXPORT_BUCKET', ''/*none*/) as string;
  if(isBlank(FIRESTORE_EXPORT_BUCKET)) return null/*not configured*/;

  const FIRESTORE_EXPORT_COLLECTIONS = getEnv('FIRESTORE_EXPORT_COLLECTIONS', ''/*none*/) as string;
  return {
    bucket: FIRESTORE_EXPORT_BUCKET,
    collections: isBlank(FIRESTORE_EXPORT_COLLECTIONS)
                        ? []/*default to 'all'*/
                        : JSON.parse(FIRESTORE_EXPORT_COLLECTIONS)/*array of strings*/
  };
})()/*execute*/;
export const FirestoreExportConfigInfo = configInfo;

// ********************************************************************************
// REF: https://firebase.google.com/docs/firestore/solutions/schedule-export
export const exportFirestoreToGCS = async (): Promise<string | undefined> => {
  // by contract if there is no configured FIRESTORE_EXPORT(.bucket) then no-op
  if(!configInfo) { logger.info(`No Firestore export since FIRESTORE_EXPORT(.bucket) is not configured.`)/*for sanity*/; return/*nothing to do, by contract*/; }

  // REF: https://googleapis.dev/nodejs/firestore/latest/v1.FirestoreAdminClient.html
  const client = new firestore.v1.FirestoreAdminClient();

  const bucketName = `gs://${configInfo.bucket}`,
        databaseName = client.databasePath(PROJECT_ID, '(default)'/*literal*/);

  try {
    // REF: https://cloud.google.com/firestore/docs/reference/rest/v1/projects.databases/exportDocuments
    // REF: https://cloud.google.com/firestore/docs/reference/rest/Shared.Types/Operation
    // NOTE: specific collections *must* be exported for the import to be used by
    //       BigQuery. A 'export all' is useful for backups.
    const startTimestamp = Date.now();
    const [lrOperation] = await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucketName,
      collectionIds: configInfo.collections,
    });

    logger.info(`Firestore export to GCS operation started.`);

    // wait until the operation is complete
    // REF: https://googleapis.github.io/gax-nodejs/classes/Operation.html
    const [result] = await lrOperation.promise();

    const folder = extractFolder(result)/*GCS folder to which the export is being written*/;
    logger.info(`Firestore export to GCS (${bucketName}/${folder}) operation completed. Took ${Date.now() - startTimestamp}ms`);

    return folder;
  } catch(error) {
    throw new ApplicationError('datastore/export', `Error exporting Firestore (${databaseName}) to GCS (${bucketName}). Reason: ${error}`);
  }
};

// ================================================================================
const extractFolder = (result: google.firestore.admin.v1.IExportDocumentsResponse): string => {
  const outputUriPrefix: string | undefined = convertNullToUndefined(result['outputUriPrefix']);
  if(outputUriPrefix === undefined) throw new ApplicationError('functions/aborted', `Could not read Firestore export Operation output URI prefix.`);

  const folderStartIndex = outputUriPrefix.lastIndexOf('/');
  if(folderStartIndex < 0) throw new ApplicationError('functions/aborted', `Malformed Firestore export Operation output URI prefix (${outputUriPrefix}).`);
  return outputUriPrefix.substring(folderStartIndex + 1/*after*/);
};

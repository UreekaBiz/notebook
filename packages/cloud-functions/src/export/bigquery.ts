import { BigQuery, JobLoadMetadata } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import { logger } from 'firebase-functions';

import { isBlank } from '@ureeka-notebook/service-common';

import { getEnv, PROJECT_ID } from '../util/environment';
import { FirestoreExportConfigInfo } from './export';

// ********************************************************************************
const BIGQUERY_IMPORT_DATASET = getEnv('BIGQUERY_IMPORT_DATASET', ''/*none*/) as string;

// ********************************************************************************
// NOTE: 'dateString' is the name of the folder within the GCS bucket that the
//       Firestore export was written to and that this will import
export const importFirestoreCollectionsIntoBigQuery = async (dateString: string) => {
  // by contract if there is no configured BIGQUERY_IMPORT(.dataset) or
  // FIRESTORE_EXPORT(.bucket) then no-op
  if(isBlank(BIGQUERY_IMPORT_DATASET) || !FirestoreExportConfigInfo) { logger.info(`No BigQuery import since BIGQUERY_IMPORT(.dataset) or FIRESTORE_EXPORT(.bucket) is not configured.`)/*for sanity*/; return/*nothing to do, by contract*/; }

  const projectId = PROJECT_ID/*for convenience*/;
  const bucket = FirestoreExportConfigInfo.bucket;
  const collections = FirestoreExportConfigInfo.collections;

  // REF: https://cloud.google.com/bigquery/docs/loading-data-cloud-storage-csv#nodejs
  logger.info(`Importing Firebase Export into BigQuery from gs://${bucket}/${dateString}`);
  const startTimestamp = Date.now();
  const bigquery = new BigQuery({ projectId });
  const storage = new Storage({ projectId });
  await Promise.all(collections.map(async (collection) => {
    try {
      const gcsFile = storage.bucket(bucket).file(toStorageFilename(dateString, collection));
      const metadata: JobLoadMetadata ={
        sourceFormat: 'DATASTORE_BACKUP'/*Firestore*/,
        writeDisposition: 'WRITE_TRUNCATE'/*basically 'replace'*/,
      };
      const [job] = await bigquery.dataset(BIGQUERY_IMPORT_DATASET)
                                  .table(toBigQueryTableId(collection))
                                  .load(gcsFile, metadata)/*waits for job to finish*/;

      const errors = job.status?.errors;
      if((errors !== undefined) && (errors.length > 0))
        logger.error(`Error importing Firestore Collection (${collection}) into BigQuery. Reason: `, errors);
      else /*no errors*/
        logger.info(`BigQuery Firestore import job (${job.id}) for collection '${collection}' completed. Took ${Date.now() - startTimestamp}ms`);
    } catch(error) {
      logger.error(`Error importing Firestore Collection (${collection}) into BigQuery. Reason: `, error);
    }
  }));
  logger.info(`BigQuery Firestore import completed. Took ${Date.now() - startTimestamp}ms`);
};

// ================================================================================
// creates the Firestore export format
// EX: 2020-03-26T23:40:11_27665/all_namespaces/kind_feed-comments/all_namespaces_kind_feed-comments.export_metadata
const toStorageFilename = (dateString: string, collection: string) =>
 `${dateString}/all_namespaces/kind_${collection}/all_namespaces_kind_${collection}.export_metadata`;

// converts '-' named Firestore Collections to '_' for BigQuery
const toBigQueryTableId = (collection: string) =>
  collection.replace(/-/g, '_');

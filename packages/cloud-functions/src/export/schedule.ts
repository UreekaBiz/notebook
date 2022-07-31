import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';

import { isLocalDevelopment } from '@ureeka-notebook/service-common';

import { wrapOnRun, MaintenanceRuntimeOpts } from '../util/function';
import { importFirestoreCollectionsIntoBigQuery } from './bigquery';
import { exportFirestoreToGCS } from './export';

// ********************************************************************************
export const scheduleFirestoreExport = functions.runWith(MaintenanceRuntimeOpts)
                                          .pubsub.schedule('every 4 hours').onRun(wrapOnRun(async (context) => {
  if(isLocalDevelopment()) { logger.info(`scheduleFirestoreExport is a no-op in local-dev.`); return/*no-op if local-dev*/; }

  const folder = await exportFirestoreToGCS();
  if(folder) await importFirestoreCollectionsIntoBigQuery(folder);
}));

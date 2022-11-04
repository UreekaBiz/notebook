import { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { QueryDocumentIterator } from '../util/QueryDocumentIterator';
import { asyncBatchConsume, ITERATOR_BATCH_SIZE } from '../util/iterator';
import { MigrationFunction, MigrationKey } from './type';

// ********************************************************************************
export const migrateTask = async <T extends string>(key: MigrationKey, query: Query<T>, migrate: MigrationFunction<T>) => {
  let successCount = 0,
      errorCount = 0;
  const migrator = async (snapshot: QueryDocumentSnapshot<T>) => {
    try {
      const result = await migrate(snapshot);
      if(result === true) successCount++;
      else errorCount++;
    } catch(error) {
      errorCount++/*by definition*/;
      logger.error(`Unhandled migration error. Reason: `, error);
    }
  };

  await asyncBatchConsume(
    new QueryDocumentIterator(query, ITERATOR_BATCH_SIZE),
    snapshot => migrator(snapshot),
    ITERATOR_BATCH_SIZE/*same size*/
  );

  logger.info(`Migrated ${successCount} '${key}' document(s) with ${errorCount} error(s).`);
};

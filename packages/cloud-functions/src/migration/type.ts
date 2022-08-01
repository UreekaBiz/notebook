import { DocumentSnapshot, Query } from 'firebase-admin/firestore';

// ********************************************************************************
export enum MigrationKey {
  // NOTE: these two must *not* be run in production -- they're only examples
  ExampleNotebookAddField = 'example|notebook|add-field',
  ExampleNotebookRemoveField = 'example|notebook|remove-field',
}

// --------------------------------------------------------------------------------
export type MigrationFunction<T> = (snapshot: DocumentSnapshot<T>) => Promise<boolean>;

/** migration Task identified by {@link MigrationKey} */
export type MigrationTask<T> = Readonly<{
  /** the Firestore {@link Query} that defines the set of Documents to be migrated */
  query: Query<T>;

  /** executes the desired migration on the specified Document Reference and Document
   *  from the above Query. If the migration was not successful then `false` must be
   *  returned otherwise it is assumed the migration was successful. */
  migrate: MigrationFunction<T>;
}>;

import * as Validate from 'yup';

import { Modify } from '@ureeka-notebook/service-common';

import { MigrationKey } from './type';

// function types that are *not* shared with the client but instead are server-to-server
// (in this case, between Cloud task and target)
// ********************************************************************************
// == Migration ===================================================================
export const Migrate_Rest_Schema = Validate.object({
  /** the {@link MigrationKey} that identifies the migration to run */
  key: Validate.string()
          .oneOf(Object.values(MigrationKey))
          .required(),
}).noUnknown();
export type Migrate_Rest = Readonly<Modify<Validate.InferType<typeof Migrate_Rest_Schema>, {
  key: MigrationKey/*explicit*/;
}>>;

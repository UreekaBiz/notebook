import * as Validate from 'yup';

import { Identifier_Schema } from '@ureeka-notebook/service-common';

// function types that are *not* shared with the client but instead are server-to-server
// (in this case, between Cloud task and target)
// ********************************************************************************
// == Share =======================================================================
export const ShareBatchNotification_Rest_Schema = Validate.object({
  /** the {@link NotebookIdentifier} of the Notebook being shared */
  notebookId: Identifier_Schema
          .required(),

  /** the list of {@link UserIdentifier}s with whom a Notebook is being shared */
  userIds: Validate.array()
                .of(Identifier_Schema.required())
                .required(),
}).noUnknown();
export type ShareBatchNotification_Rest = Readonly<Validate.InferType<typeof ShareBatchNotification_Rest_Schema>>;

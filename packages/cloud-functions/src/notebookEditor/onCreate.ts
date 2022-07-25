import { firestore, logger } from 'firebase-functions';

import { NotebookVersion, NotebookVersionParams, NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { wrapOnCreateOrDelete } from '../util/function';
import { createCheckpoint } from './checkpoint';

// ********************************************************************************
// == Step ========================================================================
export const onCreateNotebookVersion = firestore.document(NOTEBOOK_VERSION)
                                                .onCreate(wrapOnCreateOrDelete<NotebookVersion, NotebookVersionParams>(async (snapshot, context) => {
  if(!snapshot.exists) { logger.warn('Unexpected empty snapshot in on-create Notebook Version trigger'); return/*nothing else to do*/; }

  const notebookId = context.params.notebookId/*from context*/,
        index = snapshot.data()!.index;

  try {
    await createCheckpoint(notebookId, index)/*throws on error*/;
  } catch(error) {
    logger.warn(`Failed to write Checkpoint for Notebook (${notebookId}) at Version (${index}). Reason: `, error);
    return/*nothing more to do*/;
  }
}));
import { logger } from 'firebase-functions';

import { isType, LabelIdentifier, LabelSummary_Create, LabelSummary_Update, LabelVisibility, UserIdentifier } from '@ureeka-notebook/service-common';

import { labelSummaryRef } from './datastore';
import { DatabaseIncrement } from 'util/rtdb';

// ********************************************************************************
// == Create ======================================================================
// NOTE: doesn't throw by design
export const createLabelSummary = async (userId: UserIdentifier, labelId: LabelIdentifier, visibility: LabelVisibility) => {
  try {
    // set the default summary record for a new Label
    const record: LabelSummary_Create = {
      notebook: 1/*initially one*/,
      publishedNotebook: (visibility === LabelVisibility.Private) ? 0/*initially not published*/ : 1/*initially published*/,
    };
    await labelSummaryRef(labelId).set(record);
  } catch(error) {
    logger.error(`Error setting RTDB Label Summary (${labelId}) for User (${userId}). Reason: `, error);
  }
};

// == Update ======================================================================
// NOTE: doesn't throw by design
export const updateLabelSummary = async (userId: UserIdentifier, labelId: LabelIdentifier, visibility: LabelVisibility, increment: -1 | 1) => {
  try {
    await labelSummaryRef(labelId).transaction((labelSummary: LabelSummary_Update) => {
      if(labelSummary === null) return labelSummary/*local cache miss*/;
      return isType<LabelSummary_Update>({
        ...labelSummary,
        notebook: DatabaseIncrement(increment),
      });
    });
  } catch(error) {
    logger.error(`Error updating RTDB Label Summary (${labelId}) for User (${userId}). Reason: `, error);
  }
};

// == Delete ======================================================================
// NOTE: doesn't throw by design
export const deleteLabelSummary = async (userId: UserIdentifier, labelId: LabelIdentifier) => {
  try {
    await labelSummaryRef(labelId).remove();
  } catch(error) {
    logger.error(`Error setting RTDB Label Summary (${labelId}) for User (${userId}). Reason: `, error);
  }
};

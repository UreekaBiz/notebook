import { logger } from 'firebase-functions';

import { IncrementDecrement, Identifier, ReactionType } from '@ureeka-notebook/service-common';

import { reactionSummaryRef } from './datastore';
import { DatabaseIncrement } from '../util/rtdb';

// ********************************************************************************
export const updateReactionSummary = async (reactionType: ReactionType, entityId: Identifier, update: IncrementDecrement) => {
  try {
    await reactionSummaryRef(entityId).update({
      [reactionType]: DatabaseIncrement(update),
    });
  } catch(error) {
    // NOTE: doesn't throw by design
    logger.error(`Error updating RTDB Reaction Summary for Entity (${entityId}) for '${reactionType}' reaction. Reason: `, error);
  }
};

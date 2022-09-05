import { defaultReactionSummary, Identifier, ReactionSummary_Storage } from '@ureeka-notebook/service-common';

import { reactionSummaryRef } from './datastore';
import { object } from '../util/observableObject';

// ********************************************************************************
// == Reaction Summary ============================================================
export const reactionSummary$ = (entityId: Identifier) =>
  object(reactionSummaryRef(entityId), snapshot => {
    // an Entity will not have a summary until it is reacted to so this provides a default
    const summary = snapshot.val() as ReactionSummary_Storage;
    return { ...defaultReactionSummary, ...summary };
  });

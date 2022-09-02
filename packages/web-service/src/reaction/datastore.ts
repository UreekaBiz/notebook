import { ref } from 'firebase/database';

import { Identifier, REACTION_SUMMARIES } from '@ureeka-notebook/service-common';

import { database } from '../util/firebase';

// ** Firestore *******************************************************************
// NOTE: not used on the client

// ** RTDB ************************************************************************
// == Collection ==================================================================
// -- Reaction Summary ------------------------------------------------------------
export const reactionSummaryRef = (entityId: Identifier) => ref(database, `/${REACTION_SUMMARIES}/${entityId}`);

import { CollectionReference } from 'firebase-admin/firestore';

import { Identifier, ReactionIdentifier, ReactionUserEntity_Storage, UserIdentifier, REACTIONS, REACTION_SUMMARIES, REACTION_USERS } from '@ureeka-notebook/service-common';

import { database, firestore } from '../firebase';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: reaction/datastore.ts

// .. Action Types ................................................................
// SEE: @ureeka-notebook/service-common: reaction/datastore.ts

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Reaction --------------------------------------------------------------------
const reactionCollection = firestore.collection(REACTIONS) as CollectionReference/*this level is never used*/;
const reactionDocument = (reactionId: ReactionIdentifier) => reactionCollection.doc(reactionId)/*this level is never used directly*/;
export const reactionUserCollection = (reactionId: ReactionIdentifier) =>
  reactionDocument(reactionId).collection(REACTION_USERS) as CollectionReference<ReactionUserEntity_Storage<any>>;
export const reactionUserDocument = (reactionId: ReactionIdentifier, userId: UserIdentifier) =>
  reactionUserCollection(reactionId).doc(userId);

// ** RTDB ************************************************************************
// == Collection ==================================================================
// -- Reaction Summary ------------------------------------------------------------
export const reactionSummaryRef = (entityId: Identifier) => database.ref(`/${REACTION_SUMMARIES}/${entityId}`);

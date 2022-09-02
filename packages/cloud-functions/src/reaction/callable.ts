import * as functions from 'firebase-functions';

import { ReactionToggle_Rest, ReactionToggle_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall, SmallMemory } from '../util/function';
import { toggleReaction } from './reaction';

// ********************************************************************************
export const reactionToggle = functions.runWith(SmallMemory).https.onCall(wrapCall<ReactionToggle_Rest, boolean>(
{ name: 'reactionToggle', schema: ReactionToggle_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  return await toggleReaction(userId!/*auth'd*/, data.type, data.target, data.entityId);
}));

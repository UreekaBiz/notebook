import { generateReactionIdentifier, Identifier, ReactionTarget, ReactionType, ReactionUserEntity_Write, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { reactionUserDocument } from './datastore';
import { updateReactionSummary } from './reactionSummary';

// ********************************************************************************
export const toggleReaction = async (
  userId: UserIdentifier, reactionType: ReactionType, target: ReactionTarget, entityId: Identifier
): Promise<boolean> => {
  // if the User has already reacted to the Entity, then remove the reaction and
  // decrement the Reaction Summary. Otherwise, add the reaction and increment.
  let summaryUpdate: 1/*increment*/ | -1/*decrement*/;
  try {
    const reactionId = generateReactionIdentifier(reactionType, entityId),
          reactionUserRef = reactionUserDocument(reactionId, userId);
    summaryUpdate = await firestore.runTransaction(async (transaction) => {
      // FIXME: put in (delegated) logic to ensure that the User is allowed to react
      //        to the Entity (e.g. User can't react private Notebooks that they're
      //        not at least a Viewer of)

      const snapshot = await transaction.get(reactionUserRef);
      if(snapshot.exists) { /*already reacted*/
        transaction.delete(reactionUserRef);

        return -1/*decrement*/;
      } else { /*document doesn't exist -- User hasn't reacted yet*/
        const userReaction: ReactionUserEntity_Write<any> = {
          reactionType,
          userId,
          entityId,

          createdBy: userId,
          createTimestamp: ServerTimestamp/*by contract*/,
        };
        transaction.set(reactionUserRef, userReaction);

        return +1/*increment*/;
      }
    });
  } catch(error) {
    throw new ApplicationError('datastore/write', `Error updating ${target} (${entityId})  '${reactionType}' Reaction for User (${userId}). Reason: `, error);
  }

  // RTDB summary record
  await updateReactionSummary(reactionType, entityId, summaryUpdate);

  return (summaryUpdate === +1)/*Increment => added => true*/;
};

import { Creatable } from '../util/datastore';
import { hashString } from '../util/hash';
import { Identifier } from '../util/type';
import { UserIdentifier } from '../util/user';

// ********************************************************************************
// synthetic ReactionIdentifiers are defined by a hash of Entity's Identifier and
// the Reaction type
export type ReactionIdentifier = Identifier/*alias*/;
export const generateReactionIdentifier = (reactionType: ReactionType, entityId: Identifier): ReactionIdentifier =>
  hashString(`${entityId}|${reactionType}`);

// =================================================================================
/** all possible reaction types. Not all must be used when associated with an entity */
// SEE: #parseReactionType() (which must be updated if this is updated)
export enum ReactionType {
  Liked = 'liked',
  Loved = 'loved',
  Upvoted = 'upvoted',
}

/** reactions can be 'targeted' (applied) to any entity that has a unique document
 *  identifier. This enum simply defines those entities for sanity */
export enum ReactionTarget {
  Asset = 'asset',
  Label = 'label',
  Notebook = 'notebook',
  User = 'user',
}

// == Reaction - Entity (Firestore) ===============================================
/** to ensure that each User only reacts once per Entity, this entry is written and
 *  the corresponding {@link ReactionSummary} is updated */
export type ReactionUserEntity<I extends Identifier> = Creatable & Readonly<{ /*Firestore only*/
  /** the {@link ReactionType} */
  reactionType: ReactionType/*write-once on create*/;

  /** the User's {@link UserIdentifier} */
  userId: UserIdentifier/*write-once on create*/;

  /** the Entity's {@link Identifier} */
  entityId: I/*write-once on create*/;
}>;

// == Reaction Summary (RTDB) =====================================================
export type ReactionSummary = Readonly<{ /*RTDB only*/
  /** the count of unique users that have had the {@link ReactionType} for the
   *  specific entity */
  [P in ReactionType]: number/*atomic-increment*/;
}>;
export const defaultReactionSummary = Object.values(ReactionType).reduce((o, reactionType) => ({ ...o, [reactionType]: 0/*default*/ }), {}) as ReactionSummary;

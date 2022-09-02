import { FieldValue } from '../util/firestore';
import { Identifier, Modify } from '../util/type';
import { ReactionSummary, ReactionType, ReactionUserEntity } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// -- Reaction --------------------------------------------------------------------
export const REACTIONS = 'reactions'/*top-level collection*/;
export const REACTION = `${REACTIONS}/{reactionId}`/*document (used by CF triggers)*/;
export const REACTION_USERS = 'reaction-users'/*sub-collection*/;
export const REACTION_USER = `${REACTIONS}/{reactionId}/${REACTION_USERS}/{userId}`/*document (used by CF triggers)*/;

// == RTDB ========================================================================
// -- Reaction Summary ------------------------------------------------------------
// reactions are stored per entity (e.g. Asset, Label, Notebook, User)
export const REACTION_SUMMARIES = 'reaction-summaries'/*top-level 'collection'*/;
export const REACTION_ENTITY_SUMMARY = `${REACTION_SUMMARIES}/{entityId}` as const/*'collection' (used by CF triggers)*/;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Reaction ---------------------------------------------------------------------
export type ReactionUserEntity_Storage<I extends Identifier> = ReactionUserEntity<I>/*nothing additional*/;

// == RTDB ========================================================================
// -- Reaction Summary ------------------------------------------------------------
export type ReactionSummary_Storage = ReactionSummary/*nothing additional*/;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- Reaction --------------------------------------------------------------------
// always written as if new (i.e. always completely overwritten)
export type ReactionUserEntity_Write<I extends Identifier> = Modify<ReactionUserEntity_Storage<I>, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
}>>;
// NOTE: hard-delete so no delete Action Type

// == RTDB ========================================================================
// -- Reaction Summary ------------------------------------------------------------
export type ReactionSummary_Update = Modify<ReactionSummary_Storage, Readonly<{
  [P in ReactionType]?: Object/*sentinel value for atomic Increment / Decrement*/;
}>>;

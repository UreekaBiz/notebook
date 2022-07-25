import { ObjectTuple } from '../util/datastore';
import { FieldValue } from '../util/firestore';
import { Modify } from '../util/type';
import { UserIdentifier } from '../util/user';
import { UserProfilePublic } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// NOTE: odd naming to match the conventions
// SEE: ../authUser/datastore.ts
export const USER_PROFILE_PUBLICS = 'user-profile-publics'/*top-level collection*/;
export const USER_PROFILE_PUBLIC = `${USER_PROFILE_PUBLICS}/{userId}` as const/*document (used by CF triggers)*/;

// -- Trigger Context -------------------------------------------------------------
export type UserProfilePublicParams = Readonly<{
  userId/*NOTE: must match #USER_PROFILE_PUBLIC*/: UserIdentifier;
}>;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- User Profile Public ---------------------------------------------------------
export type UserProfilePublic_Storage = UserProfilePublic/*nothing additional*/;
export type UserProfilePublicTuple = ObjectTuple<UserIdentifier, UserProfilePublic_Storage>;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- User Profile Public ---------------------------------------------------------
// Public Profiles are *only* written as a result of an on-write trigger to the
// Private Profile. A full-write is performed on each update.
export type UserProfilePublic_Write = Readonly<Modify<UserProfilePublic_Storage, {
  createTimestamp: FieldValue/*server written*/;
  updateTimestamp: FieldValue/*server written*/;
}>>;

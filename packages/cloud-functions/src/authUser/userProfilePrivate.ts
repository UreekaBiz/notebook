import { DocumentReference } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { convertNullUndefinedDeep, isBlank, Mutable, nameof, removeUndefined, PresenceState, UserIdentifier, UserProfilePrivate_Create, UserProfilePrivate_Storage, UserProfilePrivate_Update, UserProfilePrivateUpdate_Rest, UserProfile_Internal, UserProfilePublic_Write, UserRole } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { userProfilePublicDocument } from '../user/datastore';
import { ApplicationError } from '../util/error';
import { DeleteField, ServerTimestamp } from '../util/firestore';
import { userProfilePrivateCollection, userProfilePrivateDocument } from './datastore';
import { writeUserProfilePublic } from './userProfilePublic';

// ********************************************************************************
// == Create ======================================================================
// NOTE: to ensure that by the time this function returns the *complete* User exists
//       (i.e. both private *and* public profiles), this creates *both* profiles
//       within the transaction. (There will be an on-write trigger that writes the
//       public profile again but this approach ensures a *complete* User exists.)
export const createUserProfilePrivate = async (userId: UserIdentifier, email?: string, imageUrl?: string, displayName?: string) => {
  const { firstName, lastName } = splitName(displayName);

  const userProfilePrivateRef = userProfilePrivateDocument(userId) as DocumentReference<UserProfilePrivate_Create>,
        userProfilePublicRef = userProfilePublicDocument(userId) as DocumentReference<UserProfilePublic_Write>;
  await firestore.runTransaction(async transaction => {
    const snapshot = await transaction.get(userProfilePrivateRef);
    if(snapshot.exists) { logger.warn(`User Profile Private already exists for User (${userId}). Could be due to a duplicate Firebase Auth trigger fire. Ignoring.`); return/*nothing else to do*/; }

    const profile: UserProfilePrivate_Create = {
      userId,
      roles: [UserRole.Free/*free by default*/],

      email,

      presence: PresenceState.Offline/*consistent and safe!*/,

      profileImageUrl: imageUrl,

      firstName,
      lastName,

      about: undefined/*none*/,

      socialMedia_facebook: undefined/*none*/,
      socialMedia_instagram: undefined/*none*/,
      socialMedia_linkedin: undefined/*none*/,
      socialMedia_tiktok: undefined/*none*/,
      socialMedia_twitter: undefined/*none*/,

      apiKeys: undefined/*none*/,

      deleted: false/*not deleted on creation*/,

      createdBy: userId/*CHECK: or SystemUser?*/,
      createTimestamp: ServerTimestamp/*by contract*/,
      lastUpdatedBy: userId,
      updateTimestamp: ServerTimestamp/*by contract*/,
    };
    transaction.create(userProfilePrivateRef, removeUndefined(profile))/*create by definition*/;

    writeUserProfilePublic(transaction, userProfilePublicRef, profile)/*also write public profile on create (by contract)*/;
  });
};

// --------------------------------------------------------------------------------
// NOTE: can't guarantee the format that the display name is in (e.g. 'username' vs.
//       '<first> <last>') so this simply takes anything before the first space as
//       the first name and everything thereafter as the last name (removing any
//       redundant spaces)
type FirstLastName = { firstName?: string; lastName?: string; };
const splitName = (displayName?: string): FirstLastName => {
  if(isBlank(displayName)) return { firstName: undefined/*none*/, lastName: undefined/*none*/ };

  const parts = displayName!.split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).filter(part => !isBlank(part)).join(' ')/*remove any spaces in last name*/;
  return { firstName, lastName };
};

// == Update ======================================================================
// updates the User's private profile based on the specified update. The specified
// update is *always merged* with the current data. Fields that are explicitly
// set to null or undefined are deleted. Fields that aren't specified are left unchanged.
export const updateUserPrivateProfile = async (userId: UserIdentifier, update: UserProfilePrivateUpdate_Rest | Partial<UserProfile_Internal>) => {
  // for sanity ensure that if any of the UserProfile_Internal fields are specified
  // that they are never `undefined` (which would cause the field to be removed).
  // Also ensure that 'deleted' is never set back to 'false' (by contract)
  const deleted = nameof<UserProfile_Internal>('deleted'),
        presence = nameof<UserProfile_Internal>('presence');
  if((deleted in update) && (((update as UserProfile_Internal).deleted === undefined) || ((update as UserProfile_Internal).deleted === false/*undelete*/))) delete (update as Mutable<Partial<UserProfile_Internal>>).deleted;
  if((presence in update) && ((update as UserProfile_Internal).presence === undefined)) delete (update as Mutable<Partial<UserProfile_Internal>>).presence;

  try {
    const userProfilePrivateRef = userProfilePrivateCollection.doc(userId/*must match userId*/) as DocumentReference<UserProfilePrivate_Update>;
    await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userProfilePrivateRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Could update User Profile Private. User (${userId}) not found.`);
      const existingUser = snapshot.data()! as UserProfilePrivate_Storage/*by definition*/;
      if(existingUser.deleted) throw new ApplicationError('data/deleted', `Cannot delete already deleted User (${userId}).`);

      const computedUpdate: UserProfilePrivate_Update = {
        // NOTE: convert performed here (rather than on full object) to ensure that
        //       any Firestore sentinel values do not get inadvertently converted
        // NOTE: must do a deep-convert due to 'apiKeys' (etc) being a nested object
        ...convertNullUndefinedDeep(update, DeleteField/*by contract*/),

        lastUpdatedBy: userId/*by definition*/,
        updateTimestamp: ServerTimestamp/*server set on every write by contract*/,
      };
      transaction.set(userProfilePrivateRef, computedUpdate, { merge: true });

      // NOTE: User Profile Public is updated by an on-write trigger rather than
      //       by this function to ensure that the User's public profile is always
      //       up-to-date regardless of how the private profile is updated (e.g.
      //       via the Firestore admin console)
    });
    logger.info(`Updated User Profile Private for User (${userId}).`);
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating User (${userId}). Reason: `, error);
  }
};

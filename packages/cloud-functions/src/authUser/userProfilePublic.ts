import { DocumentReference, Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import { computeUserNamePrefixes, computeUserSortName, keysOf, pick, removeUndefined, SystemUserId, UserProfilePrivate_Create, UserProfilePrivate_Storage, UserProfilePublic_Write, UserProfile_Core_Schema } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { userProfilePublicDocument } from '../user/datastore';
import { ServerTimestamp } from '../util/firestore';
import { userProfilePrivateDocument } from './datastore';

// the User Public Profile is created / updated from an on-write trigger from the
// Private Profile
// NOTE: this file is expressly in 'authUser' to keep it close to the on-write
//       trigger. (It could just as easily be in 'user' directory for consistency.)
// ********************************************************************************
// == Change ======================================================================
export const userProfilePrivateChangedUserProfilePublic = async (userId: string, userProfilePrivate: UserProfilePrivate_Storage) => {
  // NOTE: this does not early return for (soft) deleted Users since this needs to
  //       write whatever new state the User Profile Private has

  const userProfilePrivateRef = userProfilePrivateDocument(userId),
        userProfilePublicRef = userProfilePublicDocument(userId);
  try {
    await firestore.runTransaction(async (transaction) => {
      const privateProfileSnapshot = await transaction.get(userProfilePrivateRef);
      if(!privateProfileSnapshot.exists) { logger.info(`Existing User Profile Private deleted while trying to update User Profile Public from on-write trigger for User (${userId}). Skipping.`); return/*update too old*/; }
      const currentPrivateProfile = privateProfileSnapshot.data()!;
      if(currentPrivateProfile.updateTimestamp.valueOf() > userProfilePrivate.updateTimestamp.valueOf()) { logger.info(`Current User Profile Private newer than one from on-write trigger (${currentPrivateProfile.updateTimestamp.valueOf()} > ${userProfilePrivate.updateTimestamp.valueOf()}) for User (${userId}). Skipping.`); return/*update too old*/; }

      // TODO: clean up the public profile if the User has been (soft) deleted
      writeUserProfilePublic(transaction, userProfilePublicRef, userProfilePrivate);
    });
  } catch(error) {
    logger.error(`Unexpected error writing User Profile Public from an on-write trigger of User Profile Private for User (${userId}).`);
  }
};

// --------------------------------------------------------------------------------
// NOTE: used both when the User Profile Private is created and when it is updated
export const writeUserProfilePublic = (
  transaction: Transaction, userPublicProfileRef: DocumentReference<UserProfilePublic_Write>,
  userPrivateProfile: UserProfilePrivate_Create | UserProfilePrivate_Storage
) => {
  const document: UserProfilePublic_Write = {
    // *only* UserProfile_Core_Schema fields
    ...pick(userPrivateProfile, ...keysOf(UserProfile_Core_Schema.fields)),

    // internal fields from User Profile Private
    // SEE: UserProfile_Internal
    email: userPrivateProfile.email,
    presence: userPrivateProfile.presence,
    deleted: userPrivateProfile.deleted,

    // system-computed fields
    // SEE: UserProfile_Generated
    sortName: computeUserSortName(userPrivateProfile.firstName, userPrivateProfile.lastName),
    searchNamePrefixes: computeUserNamePrefixes(userPrivateProfile.firstName, userPrivateProfile.lastName),

    // Creatable / Updatable fields
    // SEE: Creatable & Updatable
    createdBy: userPrivateProfile.createdBy/*match since full-write*/,
    createTimestamp: userPrivateProfile.createTimestamp/*match since full-write*/,
    lastUpdatedBy: SystemUserId/*by definition*/,
    updateTimestamp: ServerTimestamp/*server set on every write by contract*/,
  };
  transaction.set(userPublicProfileRef, removeUndefined(document))/*write -not- merge*/;
};

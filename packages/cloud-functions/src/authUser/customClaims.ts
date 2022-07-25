import { logger } from 'firebase-functions';

import { isRolesChanged, userRolesFromRoles, UserProfilePrivate_Storage } from '@ureeka-notebook/service-common';

import { auth } from '../firebase';
import { getUserRecord } from '../util/auth';

// ********************************************************************************
// NOTE: this is called on every write to the User Profile Private (from the on-write
//       trigger) so it should be as efficient as possible
export const updateCustomClaims = async (userId: string, userProfilePrivate: UserProfilePrivate_Storage) => {
  // NOTE: this does not early return for (soft) deleted Users since this needs to
  //       write whatever new state the User Profile Private has (which likely has
  //       cleared the roles)

  // NOTE: this is likely the most expensive operation in the function
  const user = await getUserRecord(userId)/*throws on error*/;

  const userRoles = userRolesFromRoles(userProfilePrivate.roles);
  if(!isRolesChanged(userRoles, user.customClaims)) return/*unchanged so nothing to do*/;
  try {
    // NOTE: this does *not* propagate immediately and cause the client handler to be called
    await auth.setCustomUserClaims(userId, userRoles);
    logger.info(`Set Custom Claims (${JSON.stringify(userRoles)}) on User (${userId}).`);
  } catch(error) {
    logger.error(`Unexpected error setting Custom Claims from on-write trigger on User (${userId}). Custom claims are out of sync with the User's roles. Reason: `, error);
  }
};

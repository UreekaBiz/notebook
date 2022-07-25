import { logger } from 'firebase-functions';

import { userProfilePublicDocument } from '../user/datastore';

// ********************************************************************************
// NOTE: there are no create / delete per se since it is updated via an on-write trigger
// SEE: authUser/userProfilePublic.ts

// == Delete ======================================================================
// NOTE: there is no application-based use case for deleting the Private Profile
//       so this must have been as a result of an admin / console action. This
//       simply ensures data integrity
export const deleteUserProfilePublic = async (userId: string) => {
  const userProfilePublicRef = userProfilePublicDocument(userId);
  try {
    await userProfilePublicRef.delete();
  } catch(error) {
    logger.error('datastore/delete', `Error (hard) deleting User Profile Public from Firestore for User (${userId}). Reason: `, error);
  }
};

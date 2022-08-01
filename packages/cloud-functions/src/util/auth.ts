import { UserRecord } from 'firebase-admin/auth';

import { isCodedError, UserIdentifier } from '@ureeka-notebook/service-common';

import { auth } from '../firebase';
import { ApplicationError } from './error';

// ********************************************************************************
// convenience wrapper to explicitly pull out the User-not-found case
export const getUserRecord = async (userId: UserIdentifier): Promise<UserRecord> => {
  try {
    return await auth.getUser(userId);
  } catch(error) {
    if(isCodedError(error)) {
      if(error.code === 'auth/user-not-found') throw new ApplicationError('auth/user-not-found', `User (${userId}) does not exist in Firebase Auth.`);
      throw new ApplicationError('auth/unknown', `An unexpected error (${error.code}) occurred while retrieving User (${userId}): `, error);
    } /* else -- not a CodedError */
    throw new ApplicationError('auth/unknown', `An unexpected error occurred while retrieving User (${userId}): `, error);
  }
};

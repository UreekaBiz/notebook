import { auth, logger } from 'firebase-functions';

import { wrapAuthOnCreateOrDelete } from '../util/function';
import { extractProfile } from './authProvider';
import { createUserProfilePrivate } from './userProfilePrivate';

// ********************************************************************************
// FIXME: do the on-delete!!
// REF: https://github.com/firebase/firebase-functions/issues/530
export const onCreateFirebaseUser = auth.user().onCreate(wrapAuthOnCreateOrDelete(async user => {
  const userId = user.uid/*for convenience*/;

  try {
    const profile = extractProfile(user);
    await createUserProfilePrivate(userId, profile.email, profile.photoURL, profile.displayName)/*throws on error*/;
  } catch(error) {
    logger.warn(`Failed to create User Profile Private on Firestore Auth on-create Trigger for User (${userId}). Reason: `, error);
    return/*nothing more to do*/;
  }
}));

import { DocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';

import { UserProfilePrivateParams, UserProfilePrivate_Storage, UserSession, UserSessionUsersParams, USER_PROFILE_PRIVATE, USER_SESSIONS_USER } from '@ureeka-notebook/service-common';

import { deleteAssetUserSummary } from '../asset/assetUserSummary';
import { deleteUserProfilePublic } from '../user/userProfilePublic';
import { getChangeState } from '../util/firestore';
import { wrapOnWrite, MediumMemory } from '../util/function';
import { DataSnapshot } from '../util/rtdb';
import { updateCustomClaims } from './customClaims';
import { userProfilePrivateChangedUserProfilePublic } from './userProfilePublic';
import { changedUserSession, updateUserSession } from './userSession';

// ********************************************************************************
// == Session =====================================================================
// changes to the User-Session are listened to rather than the individual Sessions
// in order to:
// 1. update summary information at the User-level
// 2. clone any presence change to the User Profile Private
// SEE: @ureeka-notebook/web-service: authUser/support/SessionService.ts
// NOTE: name matches ref (USER_SESSIONS_USER)
export const onWriteUserSessionUser = functions.runWith(MediumMemory/*T&E*/)
                                                 .database.ref(USER_SESSIONS_USER)
                                                      .onWrite(wrapOnWrite<DataSnapshot, UserSessionUsersParams>(async (change, context) => {
  const userId = context.params.userId;
  const beforeUserSession = change.before.val() as UserSession/*for convenience*/,
        afterUserSession = change.after.val() as UserSession/*for convenience*/;
  const userSession = afterUserSession/*for convenience*/;
  if(!userSession) return/*admin deleted data in console -- ignore*/;

  // the User-Session has changed in some way (it doesn't matter if it was the
  // latest change)
  await changedUserSession(userId, beforeUserSession, afterUserSession)/*logs on error*/;

  // only update the User-Session if this is the latest change
  try {
    const snapshot = await change.after.ref.once('value');
    const latestUserSession = snapshot.val() as UserSession;
    if(latestUserSession.timestamp > userSession.timestamp) return/*nothing to do since not latest*/;
  } catch(error) {
    logger.error('datastore/read', `Error reading latest User-Session from RTDB for User (${userId}). Reason: `, error);
    return/*nothing else could / should be done (while guaranteeing data integrity)*/;
  }
  await updateUserSession(userId, userSession)/*logs on error*/;
}));

// == User Profile Private ========================================================
// UserProfilePrivate is the source-of-truth for User Profile Public and Custom Claims.
// on-write triggers to #USER_PROFILE_PRIVATE cause User Profile Public and the
// Custom Claims to be updated

// NOTE: this *CANNOT* write to itself to ensure no on-write cycles
export const onWriteUserProfilePrivate = functions.runWith(MediumMemory)
                                                    .firestore.document(USER_PROFILE_PRIVATE)
                                                      .onWrite(wrapOnWrite<DocumentSnapshot<UserProfilePrivate_Storage>, UserProfilePrivateParams>(async (change, context) => {
  const userId = context.params.userId/*from path*/;
  const { isLatest, latestDocument } = await getChangeState(change, `User Private Profile V2 (${userId})`);
  if(!latestDocument) {
    await deleteUserProfilePublic(userId)/*data consistency -- logs on error*/;

    // TODO: do the remainder in a Task?

    // TODO: think about how Notebooks are handled (especially those that are shared)

    // TODO: delete all Assets associated with the User
    await deleteAssetUserSummary(userId)/*data consistency -- logs on error*/;

    return/*admin deleted data in console -- ignore*/;
  } /* else -- the document has not been deleted */
  if(!isLatest) return/*don't update since not latest (*that* trigger will update)*/;

  await updateCustomClaims(userId, latestDocument)/*logs on error*/;
  await userProfilePrivateChangedUserProfilePublic(userId, latestDocument)/*logs on error*/;
}));

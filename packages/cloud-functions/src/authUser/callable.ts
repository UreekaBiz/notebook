import * as functions from 'firebase-functions';

import { omit, SessionClear_Rest, SessionClear_Rest_Schema, SessionUpdate_Rest, SessionUpdate_Rest_Schema, UserProfilePrivateUpdate_Rest, UserProfilePrivateUpdate_Rest_Schema } from '@ureeka-notebook/service-common';

import { wrapCall, MediumMemory, SmallMemory } from '../util/function';
import { clearSession, updateSession } from './session';
import { updateUserPrivateProfile } from './userProfilePrivate';

// ********************************************************************************
// == Session =====================================================================
// clears the specified User-Session
export const authUserSessionClear = functions.runWith(SmallMemory).https.onCall(wrapCall<SessionClear_Rest>(
{ name: 'authUserSessionClear', schema: SessionClear_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await clearSession(userId!/*auth'd*/, data.sessionId);
}));

// sets if it doesn't exist or updates if present the specified session
export const authUserSessionUpdate = functions.runWith(MediumMemory).https.onCall(wrapCall<SessionUpdate_Rest>(
{ name: 'authUserSessionUpdate', schema: SessionUpdate_Rest_Schema, requiresAuth: true },
async (data, context, userId) => {
  await updateSession(userId!/*auth'd*/, data.sessionId, omit(data, 'sessionId'));
}));

// .. Heartbeat ...................................................................
// simply updates the timestamp (server-set) of the specified User-Session and
// ignores any other Session fields in the request
export const authUserSessionHeartbeat = functions.runWith(SmallMemory).https.onCall(wrapCall<SessionUpdate_Rest>(
{ name: 'authUserSessionHeartbeat', schema: SessionUpdate_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  await updateSession(userId!/*auth'd*/, data.sessionId, {}/*no request-based updates*/);
}));

// == User Private Profile ========================================================
export const authUserUserPrivateProfileUpdate = functions.https.onCall(wrapCall<UserProfilePrivateUpdate_Rest>(
{ name: 'authUserUserPrivateProfileUpdate', schema: UserProfilePrivateUpdate_Rest_Schema, convertNullToUndefined: true, requiresAuth: true },
async (data, context, userId) => {
  await updateUserPrivateProfile(userId!/*auth'd*/, data)/*throws on error*/;
}));

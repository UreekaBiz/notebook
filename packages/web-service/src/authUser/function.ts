import { httpsCallable } from 'firebase/functions';

import { SessionClear_Rest, SessionUpdate_Rest, UserProfilePrivateUpdate_Rest } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { wrapHttpsCallable } from '../util/function';

// ********************************************************************************
// == Session =====================================================================
export const authUserSessionClear = wrapHttpsCallable<SessionClear_Rest>(httpsCallable(functions, 'authUserSessionClear'));
export const authUserSessionUpdate = wrapHttpsCallable(httpsCallable<SessionUpdate_Rest>(functions, 'authUserSessionUpdate'));

// .. Heartbeat ...................................................................
export const authUserSessionHeartbeat = wrapHttpsCallable<SessionUpdate_Rest>(httpsCallable(functions, 'authUserSessionHeartbeat'));

// == User Private Profile ========================================================
export const updateUserProfilePrivate = wrapHttpsCallable<UserProfilePrivateUpdate_Rest>(httpsCallable(functions, 'authUserUserPrivateProfileUpdate'));

import { httpsCallable } from 'firebase/functions';

import { Identifier, SessionClear_Rest, SessionUpdate_Rest, UserConfigurationCreate_Rest, UserConfigurationDelete_Rest, UserConfigurationUpdate_Rest, UserProfilePrivateUpdate_Rest } from '@ureeka-notebook/service-common';

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

// == User Configuration ==========================================================
export const createUserConfiguration = wrapHttpsCallable<UserConfigurationCreate_Rest, Identifier>(httpsCallable(functions, 'authUserUserConfigurationCreate'));
export const updateUserConfiguration = wrapHttpsCallable<UserConfigurationUpdate_Rest>(httpsCallable(functions, 'authUserUserConfigurationUpdate'));
export const deleteUserConfiguration = wrapHttpsCallable<UserConfigurationDelete_Rest>(httpsCallable(functions, 'authUserUserConfigurationDelete'));

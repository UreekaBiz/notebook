import Cookies from 'universal-cookie';

import { hashString, isBlank, SESSION_COOKIE } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../../logging';

const log = getLogger(ServiceLogger.AUTH_USER);

// FirestoreAuthService delegate that handles the session cookie (used for SSR auth)
// ********************************************************************************
// TODO: references to better approaches:
// REF: https://firebase.google.com/docs/auth/admin/manage-cookies
// REF: https://firebase.google.com/docs/auth/admin/verify-id-tokens
// REF: https://github.com/gladly-team/next-firebase-auth
// REF: https://colinhacks.com/essays/nextjs-firebase-authentication

// NOTE: *cannot* reuse Cookies instances. A new one must be created each time.

export const clearAuthSessionCookie = () => {
  log.debug(`Removing Session cookie ${SESSION_COOKIE}.`);

  const cookies = new Cookies();
        cookies.remove(SESSION_COOKIE);
};

export const setAuthSessionCookie = (idToken: string) => {
  // CHECK: what sane value should max-age be set to?
  const cookies = new Cookies();
  log.debug(`Updating Session cookie ${SESSION_COOKIE}. Previous: ${cookies.get(SESSION_COOKIE) ? hashString(cookies.get(SESSION_COOKIE)) : '<none>'}; New: ${isBlank(idToken) ? '<none>' : hashString(idToken)}`)/*hashing to keep log small*/;
        cookies.set(SESSION_COOKIE, idToken, { path: '/'/*accessible on every route*/, sameSite: 'strict' });
};

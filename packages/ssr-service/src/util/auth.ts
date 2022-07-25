import { logger } from 'firebase-functions';

import { UserIdentifier, SESSION_COOKIE } from '@ureeka-notebook/service-common';

import { auth } from '../firebase';
import { NextHttpRequest } from './nextjs';

// SEE: https://github.com/firebase/functions-samples/tree/main/authorized-https-endpoint
// ********************************************************************************
// retrieves the userId from the auth'ed User making the request. There must be a
// valid Authorization header or session cookie that corresponds to a valid User
export const validateFirebaseIdToken = async (req: NextHttpRequest): Promise<UserIdentifier | null/*not a valid User*/> => {
  // TODO: store which context the token came from in order to provide a more
  //       meaningful log message below
  let idToken: string | undefined = undefined/*not authed by default*/;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    // read the ID token from the Authorization header
    idToken = req.headers.authorization.split('Bearer ')[1];
    logger.info(`Read Firebase token (${!!idToken}) from Authorization header.`);
  } else if(req.cookies) {
    // read the ID token from cookie
    idToken = req.cookies[SESSION_COOKIE];
    logger.info(`Read Firebase token (${!!idToken}) from Session cookie.`);
  } else {
    // no cookie or auth header
    logger.info(`Firebase token not found in Authorization header or Session cookie.`);
    return null/*not auth'ed*/;
  }

  if(!idToken) return null/*not auth'ed*/;

  try {
    // CHECK: should check for revoked?!?
    const decodedIdToken = await auth.verifyIdToken(idToken);
    return decodedIdToken.uid;
  } catch(error) {
    logger.error('Error while verifying Firebase Id token:', error);
    return null/*default to not auth'ed*/;
  }
};

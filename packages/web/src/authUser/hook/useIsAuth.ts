import { useContext } from 'react';

import { isLoggedIn } from '@ureeka-notebook/web-service';

import { AuthedUserContext } from '../context/AuthUserContext';
import { useIsAuthServiceInitialized } from './useIsAuthServiceInitialized';

// ********************************************************************************
// hook that defines if the User is authenticated or not
// NOTE: if the service is not yet initialized the return value is `undefined`
// SEE: #useIsAuthServiceInitialized()
export const useIsAuth = (): boolean | undefined/*no value*/ => {
  const isAuthServiceInitialized = useIsAuthServiceInitialized();
  const authedUser = useContext(AuthedUserContext);

  if(!isAuthServiceInitialized) return undefined/*nothing to check*/;

  return isLoggedIn(authedUser!/*won't be null by check above*/);
};

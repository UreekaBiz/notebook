import { useContext } from 'react';

import { UserIdContext } from '../context/AuthUserContext';
import { useIsAuthServiceInitialized } from './useIsAuthServiceInitialized';

// ****************************************************************************
// hook that returns the userId of the current authed user
// NOTE: If the service is not yet initialized the return value will be undefined.
// SEE: #useIsAuthServiceInitialized()
export const useUserId = () => {
  const context = useContext(UserIdContext);
  const isAuthServiceInitialized = useIsAuthServiceInitialized();
  if(!isAuthServiceInitialized) return undefined/*nothing to check*/;

  return context;
};

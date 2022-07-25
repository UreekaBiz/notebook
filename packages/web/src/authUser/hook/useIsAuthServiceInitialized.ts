
import { useAuthedUser } from './useAuthedUser';

// ********************************************************************************
// hook that returns true if the Auth Service is initialized
// NOTE: this is needed since there are instances where the application must render
//       content even if the AuthService has not been initialized yet but the
//       component needs to differentiate between an unauthenticated User and the
//       service not being initialized yet
// SEE: #useIsAuth(), #useAuthedUser()
export const useIsAuthServiceInitialized = () => {
  const authedUser = useAuthedUser();
  return authedUser !== undefined/*sentinel value -- service not initialized*/;
};

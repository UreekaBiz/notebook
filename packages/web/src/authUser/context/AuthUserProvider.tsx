import  { useEffect, useState, ReactNode } from 'react';

import { getLogger, isLoggedOut, AuthedUserState, AuthUserService, Logger, UserIdentifier } from '@ureeka-notebook/web-service';

import { useIsMounted } from 'shared/hook';

import { AuthedUserContext, UserIdContext } from './AuthUserContext';

const log = getLogger(Logger.DEFAULT);

// provides access to all descendants the state of the current user's Authentication
// state
// ********************************************************************************
interface Props { children: ReactNode; }
export const AuthUserProvider: React.FC<Props> = ({ children }) => {
  const isMounted = useIsMounted();

  // == State =====================================================================
  const [authedUserState, setAuthedUserState] = useState<AuthedUserState | undefined>(undefined/*none until AuthUserService#onAuthUser*/);
  const [userId, setUserId] = useState<UserIdentifier | null/*logged out*/ | undefined/*AuthUserService not initialized*/>(undefined/*none until AuthUserService#onUpdate*/);

  // == Effects ===================================================================
  useEffect(() => {
    // initialize the AuthUserService on mount once and only once
    const authUserService = AuthUserService.create();

    const subscription = authUserService.onAuthUser$().subscribe({
      next: (authUserState) => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setAuthedUserState(authUserState);
        setUserId(isLoggedOut(authUserState) ? null/*logged out - by definition*/ : authUserState.authedUser.userId);
      },
      error: (error) => {
        log.info(`Unexpected error listening to the Auth User service. Reason: `, error);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;
      },
    });

    return () => {
      subscription.unsubscribe();
      authUserService.shutdown();
    };
    // NOTE: Ignoring dependencies since this is meant to be run only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/*only on mount/unmount*/]);

  // == UI ========================================================================
  return (
    <AuthedUserContext.Provider value={authedUserState}>
      <UserIdContext.Provider value={userId}>
        {children}
      </UserIdContext.Provider>
    </AuthedUserContext.Provider>
  );
};

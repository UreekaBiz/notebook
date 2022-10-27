import { useEffect, useState } from 'react';

import { getLogger, Logger, UserIdentifier, UserProfilePublic, UserProfileService } from '@ureeka-notebook/web-service';

import { useAsyncStatus, useIsMounted, AsyncStatus } from 'shared/hook';

const log = getLogger(Logger.USER);

// ********************************************************************************
export type UseUserProfile = {
  /** the status of the subscription */
  status: AsyncStatus;

  /** the {@link UserProfilePublic} */
  userProfile: UserProfilePublic | null/*not loaded*/;
};

// ================================================================================
// live User Profile Public for the specified User Identifier
export const useUserProfileLive = ( userId: UserIdentifier): UseUserProfile => {
  // == State =====================================================================
  const [userProfile, setUserProfile] = useState<UserProfilePublic | null/*not loaded*/>(null/*by contract*/);
  const [status, setStatus] = useAsyncStatus();

  // ------------------------------------------------------------------------------
  const isMounted = useIsMounted();

  // == Effect ====================================================================
  useEffect(() => {
    // this can be re-run if any of the dependencies changes. A flag must be used
    // to indicate if this is the current effect in order to avoid race conditions
    let isCurrentEffect = true;
    setStatus('loading');
    UserProfileService.getInstance().onUserProfile$(userId).subscribe({
      next: value => {
        if(!isMounted() || !isCurrentEffect) return/*component is unmounted or another useEffect was executed, prevent unwanted state updates*/;

        setUserProfile(value.obj);
        setStatus('complete');
      },
      error: (error) => {
        log.info(`Unexpected error getting User Profile Public (${userId}). Error: `, error);
        if(!isMounted() || !isCurrentEffect) return/*component is unmounted or another useEffect was executed, prevent unwanted state updates*/;

        setStatus('error');
      },
    });

    return () => { isCurrentEffect = false/*by definition*/; };
  }, [isMounted, setStatus, userId]);

  return { status, userProfile };
};

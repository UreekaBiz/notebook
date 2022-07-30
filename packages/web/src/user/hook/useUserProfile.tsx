import { useEffect, useState } from 'react';

import { getLogger, Logger, UserIdentifier, UserProfilePublic, UserProfileService } from '@ureeka-notebook/web-service';

import { useAsyncStatus, useIsMounted, AsyncStatus } from 'shared/hook';

const log = getLogger(Logger.USER);

// ********************************************************************************
export type UseUserProfile = {
  /** the status of the retrieval of the User Profile */
  status: AsyncStatus;

  /** the {@link UserProfilePublic} */
  userProfile: UserProfilePublic | null/*not loaded*/;
};

// ================================================================================
// *not* live (one-shot) User Profile Public for the specified User Identifier
export const useUserProfile = ( userId: UserIdentifier): UseUserProfile => {
  const isMounted = useIsMounted();
  const [status, setStatus] = useAsyncStatus();

  // == State =====================================================================
  const [userProfile, setUserProfile] = useState<UserProfilePublic | null/*not loaded*/>(null/*by contract*/);

  // == Effects ===================================================================
  useEffect(() => {
    const getUser = async () => {
      setStatus('loading');
      try {
        setUserProfile(await UserProfileService.getInstance().getUserProfile(userId));
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setStatus('complete');
      } catch(error) {
        log.error(`Unexpected error getting User Profile Public (${userId}). Error: `, error);
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setStatus('error');
      }
    };
    getUser();
  }, [isMounted, setStatus, userId]);

  return { status, userProfile };
};

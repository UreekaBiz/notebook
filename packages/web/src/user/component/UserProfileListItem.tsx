import { Box, Flex, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { getLogger, ApplicationError, Logger, UserIdentifier, UserProfilePublic_Storage, UserProfileService } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';
import { useAsyncStatus, useIsMounted } from 'shared/hook';
import { getPublicDisplayName } from 'user/util';

const log = getLogger(Logger.UTIL);

// ********************************************************************************
interface Props {
  userId: UserIdentifier;

  /** Displays a '(you)' label at the end of the current AuthedUser name*/
  showYouLabel?: boolean;
}
// Render a UserItem with the given userId or userProfilePublic.
// NOTE: If the status of the user is other than complete this component won't
//       render anything.
export const UserProfileListItem: React.FC<Props> = ({ userId, showYouLabel = true }) => {
  // == State =====================================================================
  // FIXME: Refactor this component to make it receive the UserProfile from the
  //        props. This should follow the same pattern as UserProfileInline.
  const [userProfilePublic, setUserProfilePublic] = useState<UserProfilePublic_Storage | null>(null/*no value*/);
  const [status, setStatus] = useAsyncStatus();
  const authedUser = useAuthedUser();
  const isMounted = useIsMounted();

  const showLabel = showYouLabel && userId === authedUser?.authedUser.userId;

  // == Effect ====================================================================
  useEffect(() => {
    setStatus('loading');
    // Reset any existing state.
    setUserProfilePublic(null);

    const subscription = UserProfileService.getInstance().onUserProfile$(userId).subscribe({
      next: ({ obj }) => {
        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setUserProfilePublic(obj);
        setStatus('complete');
        if(!obj){ log.info(`User (${userId}) returned null.`); return/*nothing left to do*/; }
      },
      error: (error) => {
        if(!(error instanceof ApplicationError)) { log.error(`Unexpected error getting User (${userId}). Reason: `, error); }
        else log.info(`Error getting User (${userId}). Error: `, error);

        if(!isMounted()) return/*component is unmounted, prevent unwanted state updates*/;

        setStatus('error');
        // NOTE: Not using toast, silently 'fail'
      },
    });

    return () => subscription.unsubscribe();

  }, [isMounted, userId, setStatus]);

  // == UI ========================================================================
  // NOTE: If the user is loading or failed the UI won't display a warning, it will
  //       silently fail.
  if(status !== 'complete' || !userProfilePublic) return null;
  return (
    <Flex alignItems='center' justifyContent='space-between' width='full'>
      <Box marginRight={4}>
        {userProfilePublic.profileImageUrl ?
          <Image
            src={userProfilePublic.profileImageUrl}
            width='40px'
            height='40px'
            borderRadius={50}
          /> : null}
      </Box>
      <Box flex='1 1'/*span remaining space*/ marginRight={4} overflow='hidden' whiteSpace='nowrap'>
        <Box marginBottom='-6px' fontSize={16} fontWeight='500'>
          <Flex>
            <Box textOverflow='ellipsis' overflow='hidden'>{getPublicDisplayName(userProfilePublic)}</Box>
            <Box marginLeft={1}>{showLabel ? '(You)' : null}</Box>
          </Flex>
        </Box>
        <Box textOverflow='ellipsis' overflow='hidden' color={userProfilePublic.email ? 'rgba(0,0,0,.6)' : 'rgba(0,0,0,.3)'}>{userProfilePublic.email ?? '<hidden>'}</Box>
      </Box>
    </Flex>
  );
};

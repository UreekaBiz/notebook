import { Avatar, AvatarProps, Box, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal } from '@chakra-ui/react';

import { PresenceState, UserIdentifier, UserProfilePrivate, UserProfilePublic } from '@ureeka-notebook/web-service';

import { getBackgroundImageColor, getPrivateDisplayName, getPublicDisplayName } from 'user/util';

import { UserProfileAvatarCard } from './UserProfileAvatarCard';

// ********************************************************************************
export type UserProfileAvatarProps = AvatarProps & {
  userId: UserIdentifier;

  /** whether to show the UserProfileAvatarCard on hover */
  showAvatarCard?: boolean;

  /** shows an indicator with the presence of the User. The value is obtained from
   * the User's profile. Defaults to false. */
  showPresence?: boolean;

  // NOTE: Overriding BoxProps to require a defined value
  width: number | string;
  height: number | string;
} & ({ userPublicProfile: UserProfilePublic; } | { userPrivateProfile: UserProfilePrivate; });
/**
 * Renders the UserProfileAvatar for the given {@link UserProfilePublic}. If no
 * profileImageUrl is available, a fallback image will be displayed.
 */
export const UserProfileAvatar: React.FC<UserProfileAvatarProps> = ({ userId, showAvatarCard = true, showPresence, ...props }) => {
  let name: string,
      profileImageUrl: string | undefined,
      presence: PresenceState,
      profile: UserProfilePublic;
  // NOTE: using rest to pass the rest of the parameters to the Avatar component
  //       but avoid passing the userPublicProfile and userPrivateProfile props
  //       since they are invalid and cannot be rendered into the DOM.
  let rest: Partial<UserProfileAvatarProps>;
  if('userPublicProfile' in props) { /*other User*/
    const { userPublicProfile, ...otherProps } = props;
    rest = otherProps;
    name = getPublicDisplayName(userPublicProfile);
    presence = userPublicProfile.presence;
    profileImageUrl = userPublicProfile.profileImageUrl;
    profile = userPublicProfile;
  } else { /*this Auth'd User*/
    const { userPrivateProfile, ...otherProps } = props;
    rest = otherProps;
    name = getPrivateDisplayName(userPrivateProfile);
    presence = userPrivateProfile.presence;
    profileImageUrl = userPrivateProfile.profileImageUrl;
    profile = userPrivateProfile as unknown as UserProfilePublic;// FIXME!!!;
  }

  const color = getBackgroundImageColor(userId);

  return (
    <Popover
      trigger='hover'
      strategy='fixed'
      openDelay={400}
      isOpen={showAvatarCard ? undefined/*uncontrolled but enabled*/ : false/*disabled*/}
    >
      <PopoverTrigger>
        <Avatar
          name={name}
          src={profileImageUrl}
          opacity={showPresence && presence === PresenceState.Idle ? '0.5' : '1'}
          background={color}
          borderColor={color}
          {...rest}
        />
      </PopoverTrigger>
      <Portal>
        <Box width='100%' height='100%' zIndex='popover'>
          <PopoverContent width='min-content' zIndex={1000}>
            <PopoverBody padding={0} >
              {showAvatarCard && <UserProfileAvatarCard userId={userId} userPublicProfile={profile}/> }
            </PopoverBody>
          </PopoverContent>
        </Box>
      </Portal>
    </Popover>
  );
};

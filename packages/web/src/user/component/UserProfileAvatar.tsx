import { Avatar, AvatarProps } from '@chakra-ui/react';

import { PresenceState, UserIdentifier, UserProfilePrivate, UserProfilePublic } from '@ureeka-notebook/web-service';

import { getBackgroundImageColor, getPrivateDisplayName, getPublicDisplayName } from 'user/util';

// ********************************************************************************
export type UserProfileAvatarProps = AvatarProps & {
  userId: UserIdentifier;

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
export const UserProfileAvatar: React.FC<UserProfileAvatarProps> = ({ userId, showPresence, ...props }) => {
  let name: string,
      profileImageUrl: string | undefined,
      presence: PresenceState;
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
  } else { /*this Auth'd User*/
    const { userPrivateProfile, ...otherProps } = props;
    rest = otherProps;
    name = getPrivateDisplayName(userPrivateProfile);
    presence = userPrivateProfile.presence;
    profileImageUrl = userPrivateProfile.profileImageUrl;
  }

  const color = getBackgroundImageColor(userId);

  // SEE: index.css
  const className = presence === PresenceState.Active ? 'user_avatar-active'
                  : presence === PresenceState.Idle ? 'user_avatar--idle'
                  : 'user_avatar--offline';

  return (
    <Avatar
      name={name}
      src={profileImageUrl}
      // only add the className if the presence is true
      className={showPresence ? className : undefined}
      background={color}
      borderColor={color}
      {...rest}
    />
  );
};

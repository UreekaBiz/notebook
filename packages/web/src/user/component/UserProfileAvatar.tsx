import { Avatar, AvatarProps } from '@chakra-ui/react';

import { UserIdentifier, UserProfilePrivate, UserProfilePublic } from '@ureeka-notebook/web-service';

import { getPrivateDisplayName, getPublicDisplayName } from 'user/util';

// ********************************************************************************
type Props = AvatarProps & {
  userId: UserIdentifier;
  // NOTE: Overriding BoxProps to require a defined value
  width: number | string;
  height: number | string;
} & ({ userPublicProfile: UserProfilePublic; } | { userPrivateProfile: UserProfilePrivate; });
/**
 * Renders the UserProfileAvatar for the given {@link UserProfilePublic}. If no
 * profileImageUrl is available, a fallback image will be displayed.
 */
export const UserProfileAvatar: React.FC<Props> = ({ userId, ...props }) => {
  const name = 'userPublicProfile' in props ? getPublicDisplayName(props.userPublicProfile) : getPrivateDisplayName(props.userPrivateProfile);
  const profileImageUrl = 'userPublicProfile' in props ? props.userPublicProfile.profileImageUrl : props.userPrivateProfile.profileImageUrl;

  return <Avatar name={name} src={profileImageUrl} {...props} />;
};

import { Avatar, AvatarProps } from '@chakra-ui/react';

import { UserIdentifier, UserProfilePrivate, UserProfilePublic } from '@ureeka-notebook/web-service';

import { getBackgroundImageColor, getPrivateDisplayName, getPublicDisplayName } from 'user/util';

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
  let name: string;
  let profileImageUrl: string | undefined;
  // NOTE: using rest to pass the rest of the parameters to the Avatar component
  //       but avoid passing the userPublicProfile and userPrivateProfile props
  //       since they are invalid and cannot be rendered into the DOM.
  let rest: Partial<Props>;
  if('userPublicProfile' in props) {
    const { userPublicProfile, ...otherProps } = props;
    rest = otherProps;
    name = getPublicDisplayName(userPublicProfile);
    profileImageUrl = userPublicProfile.profileImageUrl;
  } else {
    const { userPrivateProfile, ...otherProps } = props;
    rest = otherProps;
    name = getPrivateDisplayName(userPrivateProfile);
    profileImageUrl = userPrivateProfile.profileImageUrl;
  }

  const color = getBackgroundImageColor(userId);

  return <Avatar name={name} src={profileImageUrl} background={color} borderColor={color} {...rest} />;
};

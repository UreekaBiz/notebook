import { BoxProps, Image } from '@chakra-ui/react';

import { UserIdentifier, UserProfilePublic } from '@ureeka-notebook/web-service';

import { DefaultUserProfileAvatar } from './DefaultUserProfileAvatar';

// ********************************************************************************
interface Props extends BoxProps {
  userId: UserIdentifier;
  userProfile: UserProfilePublic;
  // NOTE: Overriding BoxProps to require a defined value
  width: number | string;
  height: number | string;

  /** Font size of the DefaultUserProfileAvatar */
  fontSize: number | string;
}
/**
 * Renders the UserProfileAvatar for the given {@link UserProfilePublic}. If no
 * profileImageUrl is available, a fallback image will be displayed.
 */
export const UserProfileAvatar: React.FC<Props> = ({ userId, userProfile, ...props }) => {
  if(!userProfile.profileImageUrl) return <DefaultUserProfileAvatar userId={userId} userProfile={userProfile} {...props} />;

  return <Image src={userProfile.profileImageUrl} {...props}/>;
};

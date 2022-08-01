import { BoxProps, Image } from '@chakra-ui/react';

import { UserProfilePublic } from '@ureeka-notebook/web-service';

import { DefaultUserProfileAvatar } from './DefaultUserProfileAvatar';

// ********************************************************************************
interface Props extends BoxProps {
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
export const UserProfileAvatar: React.FC<Props> = ({ userProfile, ...props }) => {
  if(!userProfile.profileImageUrl) return <DefaultUserProfileAvatar userProfile={userProfile} {...props} />;

  return <Image src={userProfile.profileImageUrl} {...props}/>;
};

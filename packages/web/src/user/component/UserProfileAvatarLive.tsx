import { AvatarProps } from '@chakra-ui/react';

import { UserIdentifier } from '@ureeka-notebook/web-service';

import { useUserProfile } from 'user/hook/useUserProfile';

import { UserProfileAvatar } from './UserProfileAvatar';

// live version of the UserProfileAvatar component
// ********************************************************************************
type Props = AvatarProps & {
  userId: UserIdentifier;
  // NOTE: Overriding BoxProps to require a defined value
  width: number | string;
  height: number | string;
};
export const UserProfileAvatarLive: React.FC<Props> = ({ userId, ...props }) => {
  const { userProfile } = useUserProfile(userId);
  if(!userProfile) return null/*no User so nothing to show*/;

  return <UserProfileAvatar userId={userId} userPublicProfile={userProfile} {...props} />;
};

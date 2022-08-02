import { Box, BoxProps } from '@chakra-ui/react';

import { UserIdentifier, UserProfilePublic } from '@ureeka-notebook/web-service';

import { getBackgroundImageColor, getInitials } from 'user/util';

// ********************************************************************************
/**
 * Component used to display a fallback image when the {@link UserProfile} don't
 * have an avatar. The default approach is to use a pick a color from a set of
 * defined colors as a background alongside the initials of the User.
 */
interface Props extends BoxProps {
  userId: UserIdentifier;
  userProfile: UserProfilePublic;
  // NOTE: Overriding BoxProps to require a defined width and height
  width: number | string;
  height: number | string;
}
export const DefaultUserProfileAvatar: React.FC<Props> = ({ userId, userProfile, width, height, ...props }) => {
  // Pick a random color. The value is consistent across render since it picks the
  // value based on the userId.
  const backgroundColor = getBackgroundImageColor(userId);
  const initials = getInitials(userProfile);

  return (
    <Box
      backgroundColor={backgroundColor}
      width={width}
      height={height}
      borderRadius={5/*default value*/}
      position='relative'
      fontWeight={600}
      // NOTE: Explicitly putting props at the end to allow override by the caller
      {...props}
    >
      <Box
        // Positioning the text in the center of the Box
        position='absolute'
        top='50%'
        left='50%'
        transform='translate(-50%, -50%)'
      >
        {initials}
      </Box>
    </Box>
  );
};

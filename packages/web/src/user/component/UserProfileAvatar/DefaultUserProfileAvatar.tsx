import { Box, BoxProps } from '@chakra-ui/react';
import { useMemo } from 'react';

import { UserProfilePublic } from '@ureeka-notebook/web-service';

import { getInitials } from 'user/util';

/** A collection of colors used as a background colors */
const DEFAULT_IMAGE_BACKGROUND_COLORS = [
  '#F9EBC8',
  '#FEFBE7',
  '#DAE5D0',
  '#A0BCC2',
];

// ********************************************************************************
/**
 * Component used to display a fallback image when the {@link UserProfile} don't
 * have an avatar. The default approach is to use a pick a color from a set of
 * defined colors as a background alongside the initials of the User.
 */
interface Props extends BoxProps {
  userProfile: UserProfilePublic;
  // NOTE: Overriding BoxProps to require a defined width and height
  width: number | string;
  height: number | string;
}
export const DefaultUserProfileAvatar: React.FC<Props> = ({ userProfile, width, height, ...props }) => {

  // Pick a random color
  // NOTE: Using useMemo to ensure that the value don't change in each render.
  const backgroundColor = useMemo(() => DEFAULT_IMAGE_BACKGROUND_COLORS[Math.floor(Math.random() * DEFAULT_IMAGE_BACKGROUND_COLORS.length)], []);

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

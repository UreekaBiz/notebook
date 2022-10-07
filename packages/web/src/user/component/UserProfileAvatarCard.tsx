import { Flex, FlexProps, Text } from '@chakra-ui/react';

import { UserIdentifier, UserProfilePublic } from '@ureeka-notebook/web-service';

import { getPublicDisplayName } from 'user/util';

import { UserProfileAvatar } from './UserProfileAvatar';

// ********************************************************************************
interface Props extends FlexProps {
  userId: UserIdentifier;

  userPublicProfile: UserProfilePublic;
}
export const UserProfileAvatarCard: React.FC<Props> = ({ userId, userPublicProfile, ...props }) => {
  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      width='150px'
      padding='8px 12px'
      background='#FEFEFE'
      zIndex={100}
      {...props}
    >
      <UserProfileAvatar
        userId={userId}
        userPublicProfile={userPublicProfile}
        showAvatarCard={false/*NOTE: disable the AvatarCard to avoid infinite recursion*/}

        width='80px'
        height='80px'
        marginBottom={3}
      />
      <Text color='#444' fontWeight='600' textAlign='center'>
        {getPublicDisplayName(userPublicProfile)}
      </Text>
    </Flex>
  );
};

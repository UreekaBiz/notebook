import { Flex, Heading } from '@chakra-ui/react';
import { MouseEventHandler } from 'react';

import { UserIdentifier, UserProfilePublic } from '@ureeka-notebook/web-service';

import { getPublicDisplayName } from 'user/util';

import { UserProfileAvatar } from './UserProfileAvatar';

// ********************************************************************************
interface Props {
  /** the {@link UserIdentifier} of the User */
  userId: UserIdentifier;
  /**
   *  the {@link UserProfilePublic} of the User. If this value is null it will
   *  be treated as if the User failed to load.
   */
  // NOTE: The  parent Component must handle the loading status of this component
  //       since giving it a null value is not the same as not loaded yet.
  // NOTE: This component received the userProfile already loaded from the parent
  //       instead of delegating this task to this component to have a better
  //       control over the loading status and improve the reusability of this
  //       component.
  userProfile: UserProfilePublic | null;

  onClick?: MouseEventHandler<HTMLDivElement>;
}
export const UserProfileInline: React.FC<Props> = ({ userProfile, onClick, userId }) => {
  // User failed to load
  // FIXME: have a default state for this case
  if(userProfile === null) return null;

  return (
    <Flex
      alignItems='center'
      marginBottom={1}
      color='#555'
      overflow='hidden'
      _hover={{
        cursor: 'pointer',
        color: '#000',
      }}
      onClick={onClick}
    >
      <UserProfileAvatar
        userId={userId}
        userPublicProfile={userProfile}
        size='sm'
        width={5}
        height={5}
        marginRight={2}
        borderRadius={5}
      />
      <Heading
        // truncates the text
        overflow='hidden'
        whiteSpace='nowrap'
        textOverflow='ellipsis'

        fontSize={16}
      >
        {getPublicDisplayName(userProfile)}
      </Heading>
    </Flex>
  );

};

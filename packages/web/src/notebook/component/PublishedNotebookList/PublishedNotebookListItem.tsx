import { useToast, Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { MouseEventHandler } from 'react';

import { PublishedNotebookTuple } from '@ureeka-notebook/web-service';

import { coreRoutes } from 'shared/routes';
import { getMinifiedReadableDate } from 'ui/util';
import { useUserProfile } from 'user/hook/useUserProfile';
import { getDisplayName } from 'user/util';

// ********************************************************************************
interface Props {
  publishedNotebookTuple: PublishedNotebookTuple;
}
export const PublishedNotebookListItem: React.FC<Props> = ({ publishedNotebookTuple }) => {
  const { id, obj } = publishedNotebookTuple,
        { createTimestamp, createdBy, title, snippet } = obj;

  const { status, userProfile } = useUserProfile(createdBy);

  const router = useRouter();
  const toast = useToast();

  // == Handlers ==================================================================
  const handleUserClick: MouseEventHandler<HTMLDivElement> = (event) => {
    // Prevent parent container from handling the click event
    event.stopPropagation();
    toast({ title: 'Not implemented yet!' });
  };

  const handlePublishedNotebookClick: MouseEventHandler<HTMLDivElement> = (event) => {
    router.push(`${coreRoutes.publishedNotebook}/${id}`);
  };

  // == UI ========================================================================
  if(status === 'loading' || status === 'idle') return null/*still loading*/;

  return (
    <Box
      color='#444'
      _hover={{ cursor: 'pointer' }}
      onClick={handlePublishedNotebookClick}
    >
      {userProfile ? (
        <Flex
          alignItems='center'
          marginBottom={1}
          color='#555'
          _hover={{
            cursor: 'pointer',
            color: '#000',
          }}
          onClick={handleUserClick}
        >
          <Image
            src={userProfile.profileImageUrl}
            width={5}
            height={5}
            marginRight={2}
            borderRadius={5}
          />
          <Heading fontSize={16}>{getDisplayName(userProfile)}</Heading>
        </Flex>
      ) : null}
      <Heading fontSize={26}>{title}</Heading>
      <Text marginBottom={2} color='#888' fontSize={20} fontWeight={500} lineHeight='26px'>
        {snippet}
      </Text>
      <Text color='#555' fontSize={14}>{getMinifiedReadableDate(createTimestamp.toDate())}</Text>
    </Box>
  );
};
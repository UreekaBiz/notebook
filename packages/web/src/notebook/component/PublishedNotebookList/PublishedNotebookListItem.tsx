import { useToast, Box, Flex, Heading, Image, Text, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
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
  const { id, obj: { createTimestamp, createdBy, title, snippet } } = publishedNotebookTuple;

  // since there can be 'n' Users in the Published Notebook list and a limited
  // number of live subscriptions that can be made, the Users are static (not live)
  const { status, userProfile } = useUserProfile(createdBy)/*not live*/;

  const toast = useToast();

  // == Handlers ==================================================================
  const handleUserClick: MouseEventHandler<HTMLDivElement> = (event) => {
    // prevent parent container from handling the click event
    event.stopPropagation();
    toast({ title: 'Not implemented yet!' });
  };

  // == UI ========================================================================
  if(status === 'loading' || status === 'idle') return null/*still loading*/;

  return (
    <Box>
      {/* FIXME: separate the User part into separate component to handle all cases */}
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
          {/* FIXME: handle case with no avatar */}
          <Image
            src={userProfile.profileImageUrl}
            width={5}
            height={5}
            marginRight={2}
            borderRadius={5}
          />
          {/* FIXME: truncate display name for sanity */}
          <Heading fontSize={16}>{getDisplayName(userProfile)}</Heading>
        </Flex>
      ) : null/*User failed to load*//*FIXME: have a default state for this case*/}
      <NextLink href={`${coreRoutes.publishedNotebook}/${id}`} passHref/*pass ref to 'a' child -- needed to open in new tab*/ >
        <Link color='#444' textDecoration='none' _hover={{ cursor: 'pointer' }}>
          <Heading fontSize={26}>{title}</Heading>
          <Text marginBottom={2} color='#888' fontSize={20} fontWeight={500} lineHeight='26px'>
            {snippet}
          </Text>
        </Link>
      </NextLink>
      <Text color='#555' fontSize={14}>{getMinifiedReadableDate(createTimestamp.toDate())}</Text>
    </Box>
  );
};

import { useToast, Box, Heading, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { MouseEventHandler } from 'react';

import { NotebookPublishedTuple } from '@ureeka-notebook/web-service';

import { publishedNotebookRoute } from 'shared/routes';
import { getMinifiedReadableDate } from 'ui/util';
import { UserProfileInline } from 'user/component/UserProfileInline';
import { useUserProfile } from 'user/hook/useUserProfile';

// ********************************************************************************
interface Props {
  notebookPublishedTuple: NotebookPublishedTuple;
}
export const PublishedNotebookListItem: React.FC<Props> = ({ notebookPublishedTuple }) => {
  const { id, obj: { createTimestamp, createdBy, title, snippet } } = notebookPublishedTuple;

  // since there can be 'n' Users in the Published Notebook list and a limited
  // number of live subscriptions that can be made, the Users are static (not live)
  const { status, userProfile } = useUserProfile(createdBy)/*not live*/;

  const toast = useToast();

  // == Handler ===================================================================
  const handleUserClick: MouseEventHandler<HTMLDivElement> = (event) => {
    // prevent parent container from handling the click event
    event.stopPropagation();
    toast({ title: 'Not implemented yet!' });
  };

  // == UI ========================================================================
  if(status === 'loading' || status === 'idle') return null/*still loading*/;

  return (
    <Box>
      <UserProfileInline userId={createdBy} userProfile={userProfile} onClick={handleUserClick} />
      <NextLink href={publishedNotebookRoute(id)} passHref/*pass ref to 'a' child -- needed to open in new tab*/ >
        <Link color='#444' textDecoration='none' _hover={{ cursor: 'pointer' }}>
          <Heading
            fontSize={26}

            // Clamp to 2 lines
            overflow='hidden'
            display='-webkit-box'
            style={{
              lineClamp: 2,
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Heading>
          <Text
            marginBottom={2}
            color='#888'
            fontSize={20}
            fontWeight={500}
            lineHeight='26px'

            // Clamp to 2 lines
            overflow='hidden'
            display='-webkit-box'
            style={{
              lineClamp: 2,
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {snippet}
          </Text>
        </Link>
      </NextLink>
      <Text color='#555' fontSize={14}>{getMinifiedReadableDate(createTimestamp.toDate())}</Text>
    </Box>
  );
};

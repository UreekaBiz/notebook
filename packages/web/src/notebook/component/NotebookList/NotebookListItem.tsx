import { Box, Flex, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { BiPencil } from 'react-icons/bi';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { TbUser } from 'react-icons/tb';

import { getNotebookShareCounts, NotebookTuple } from '@ureeka-notebook/web-service';

import { useValidatedAuthedUser } from 'authUser/hook/useValidatedAuthedUser';
import { ShareNotebookDialog } from 'notebookEditor/component/ShareNotebookDialog';
import { notebookRoute } from 'shared/routes';
import { getMinifiedReadableDate } from 'ui/util';
import { useUserProfile } from 'user/hook/useUserProfile';
import { getPublicDisplayName } from 'user/util';

import { NotebookListItemMenu } from './NotebookListItemMenu';

// ********************************************************************************
interface Props {
  notebookTuple: NotebookTuple;
}
export const NotebookListItem: React.FC<Props> = ({ notebookTuple }) => {
  const { authedUser: { userId } } = useValidatedAuthedUser();
  const { id, obj } = notebookTuple;

  const { editors, viewers } = getNotebookShareCounts(obj);

  // since there can be 'n' Users in the Notebook List list and a limited number of
  // live subscriptions that can be made, the Users are static (not live)
  const { status, userProfile } = useUserProfile(obj.createdBy)/*not live*/;

  if(status === 'loading' || status === 'idle' ) return null/*still loading*/;

  const userName = userId === obj.createdBy ? 'You'
                 : userProfile ? getPublicDisplayName(userProfile)
                 : 'Deleted User' /** FIXME: Have a default case in which userProfile doesn't exists */;

  return (
    <Flex alignItems='center'>
      <Box flex='1 1' whiteSpace='nowrap' overflow='hidden' paddingRight={2}>
        <NextLink href={notebookRoute(id)} passHref>
          <Link
            display='block'
            flex='1 1'
            color='#444'
            fontSize='15px'
            fontWeight={600}
            textOverflow='ellipsis'
            overflow='hidden'
          >
            {obj.name}
          </Link>
        </NextLink>
        <Flex
          overflow='hidden'
          alignItems='center'
          whiteSpace='nowrap'
          color='#AAA'
          fontSize='13px'
          fontWeight={500}
        >
          {userProfile && (
            <>
              <Box marginRight={1}>
                <TbUser strokeWidth='4' size={10}/>
              </Box>
              <Text
                textOverflow='ellipsis'
                overflow='hidden'
                color='#999'
                fontWeight={600}
              >
                {userName}
              </Text>
              <Box
                width='4px'
                height='4px'
                marginX={1}
                background='currentColor'
                borderRadius='4px'
              />

            </>
          )}
          Edited
          <Text marginLeft={1} color='#999' fontWeight={600}>{getMinifiedReadableDate(obj.updateTimestamp.toDate())}</Text>
        </Flex>
      </Box>

      <ShareNotebookDialog notebook={obj} notebookId={id} component={onClick => (
        <Box
          width='34px'
          color='#BBB'
          fontSize={12}
          fontWeight={600}
          transition='all .2s'
          _hover={{
            color: '#999',
            cursor: 'pointer',
          }}
          onClick={onClick}
        >
          <Flex alignItems='center' >
            <BiPencil/>
            <Text marginLeft={1}>{editors}</Text>
          </Flex>
          <Flex alignItems='center'>
            <MdOutlineRemoveRedEye />
            <Text marginLeft={1}>{viewers}</Text>
          </Flex>
        </Box>
        )}
      />

      <NotebookListItemMenu notebookTuple={notebookTuple}  />
    </Flex>
  );
};

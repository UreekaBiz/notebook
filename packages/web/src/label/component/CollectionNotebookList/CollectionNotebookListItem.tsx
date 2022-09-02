import { Box, Flex, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { BiPencil } from 'react-icons/bi';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

import { getNotebookShareCounts, NotebookTuple } from '@ureeka-notebook/web-service';

import { ShareNotebookDialog } from 'notebookEditor/component/ShareNotebookDialog';
import { notebookRoute } from 'shared/routes';
import { getMinifiedReadableDate } from 'ui/util';
import { NotebookListItemMenu } from 'notebook/component/NotebookList/NotebookListItemMenu';

// ********************************************************************************
interface Props {
  notebookTuple: NotebookTuple;
}
export const CollectionNotebookListItem: React.FC<Props> = ({ notebookTuple }) => {
  const { id, obj } = notebookTuple;

  const { editors, viewers } = getNotebookShareCounts(obj);

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
        <Flex color='#AAA' fontSize='13px' fontWeight={500}>
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

      <NotebookListItemMenu notebookTuple={notebookTuple} />
    </Flex>
  );
};

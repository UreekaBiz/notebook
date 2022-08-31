import { Box, Flex, IconButton, Link, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { BiPencil } from 'react-icons/bi';
import { BsGrid, BsThreeDots } from 'react-icons/bs';
import { FiUsers } from 'react-icons/fi';
import { HiTrash } from 'react-icons/hi';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

import { getNotebookShareCounts, NotebookTuple } from '@ureeka-notebook/web-service';

import { AddToCollectionDialog } from 'notebookEditor/component/AddToCollectionDialog';
import { ShareNotebookDialog } from 'notebookEditor/component/ShareNotebookDialog';
import { notebookRoute } from 'shared/routes';
import { getMinifiedReadableDate } from 'ui/util';

// ********************************************************************************
interface Props {
  notebookTuple: NotebookTuple;
}
export const NotebookListItem: React.FC<Props> = ({ notebookTuple }) => {
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

      <Menu>
        <MenuButton
          as={IconButton}
          aria-label='Options'
          icon={<BsThreeDots />}
          variant='ghost'
          size='sm'
          borderRadius='100px'
        />
        <MenuList>
          <ShareNotebookDialog notebook={obj} notebookId={id} component={onClick => (
            <MenuItem disabled icon={<FiUsers />} onClick={onClick}>
              Share
            </MenuItem>
            )}
          />
          <AddToCollectionDialog notebook={obj} notebookId={id} component={onClick => (
            <MenuItem disabled icon={<BsGrid />} onClick={onClick}>
              Add to collection
            </MenuItem>
            )}
          />
          <MenuItem disabled icon={<HiTrash />}>
            Delete (Disabled!)
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

import { Box, Flex, IconButton, Link, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { BiPencil } from 'react-icons/bi';
import { BsThreeDots } from 'react-icons/bs';
import { HiTrash } from 'react-icons/hi';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

import { getNotebookShareCounts, NotebookTuple } from '@ureeka-notebook/web-service';

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
          <Link display='block' flex='1 1' color='#444' fontSize='15px' fontWeight={600} textOverflow='ellipsis' overflow='hidden'>
            {obj.name}
          </Link>
        </NextLink>
        <Flex color='#AAA' fontSize='13px' fontWeight={500}>
          Edited
          <Text marginLeft={1} color='#999' fontWeight={600}>{getMinifiedReadableDate(obj.updateTimestamp.toDate())}</Text>
        </Flex>
      </Box>

      <Box width='34px' color='#BBB' fontSize={12} fontWeight={600}>
        <Flex alignItems='center' >
          <BiPencil/>
          <Text marginLeft={1}>{editors}</Text>
        </Flex>
        <Flex alignItems='center'>
          <MdOutlineRemoveRedEye />
          <Text marginLeft={1}>{viewers}</Text>
        </Flex>
      </Box>

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
          <MenuItem disabled icon={<HiTrash />}>
            Delete (Disabled!)
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

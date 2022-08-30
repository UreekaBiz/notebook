import { Box, Flex, IconButton, Link, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { BsThreeDots } from 'react-icons/bs';
import { HiTrash } from 'react-icons/hi';

import { NotebookTuple } from '@ureeka-notebook/web-service';
import { notebookRoute } from 'shared/routes';
import { getMinifiedReadableDate } from 'ui/util';

// ********************************************************************************
interface Props {
  notebookTuple: NotebookTuple;
}
export const NotebookListItem: React.FC<Props> = ({ notebookTuple }) => {
  const { id, obj } = notebookTuple;

  return (
    <Flex alignItems='center'>
      <Box flex='1 1' >
        <NextLink href={notebookRoute(id)} passHref>
          <Link color='#222' fontSize='15px' fontWeight={600}>
            {obj.name}
          </Link>
        </NextLink>
        <Flex color='#AAA' fontSize='13px' fontWeight={500}>
          Edited
          <Text marginLeft={1} color='#999' fontWeight={600}>{getMinifiedReadableDate(obj.updateTimestamp.toDate())}</Text>
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
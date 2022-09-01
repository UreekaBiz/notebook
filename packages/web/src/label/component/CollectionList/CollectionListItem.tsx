import { Box, Flex, IconButton, Link, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { BsThreeDots } from 'react-icons/bs';
import { HiLockClosed, HiTrash } from 'react-icons/hi';
import { TbWorld } from 'react-icons/tb';

import { LabelTuple, LabelVisibility } from '@ureeka-notebook/web-service';

import { collectionRoute } from 'shared/routes';

// ********************************************************************************
interface Props {
  labelTuple: LabelTuple;
}
export const CollectionListItem: React.FC<Props> = ({ labelTuple }) => {
  const { id, obj } = labelTuple;

  return (
    <Flex alignItems='center'>
      <Box flex='1 1' whiteSpace='nowrap' overflow='hidden' paddingRight={2}>
        <NextLink href={collectionRoute(id)} passHref>
          <Link
            display='flex'
            flex='1 1'
            color='#444'
            fontSize='15px'
            fontWeight={600}
          >
            <Box textOverflow='ellipsis' overflow='hidden'>
              {obj.name}
            </Box>
            <Text marginLeft={1} color='#999'>({obj.notebookIds.length})</Text>
          </Link>
        </NextLink>

        <Flex alignItems='center' color='#CCC' fontSize='13px' fontWeight={500}>
          {obj.visibility === LabelVisibility.Private ? (
            <>
              <TbWorld />
              <Text marginLeft={1} color='#999' fontWeight={600}>
                Public
              </Text>
            </>
          ): (
            <>
              <HiLockClosed />
              <Text marginLeft={1} color='#999' fontWeight={600}>
                Private
              </Text>
            </>
          )}

          {obj.description && (
            <>
              <Box width='4px' height='4px' marginX={1} marginTop='2px' background='currentColor' borderRadius='4px' />
              <Text color='#999' fontWeight={600}>
                {obj.description}
              </Text>
            </>
          )}
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

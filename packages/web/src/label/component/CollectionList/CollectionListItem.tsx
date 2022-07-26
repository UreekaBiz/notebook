import { Box, Flex, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { HiLockClosed } from 'react-icons/hi';
import { TbWorld } from 'react-icons/tb';

import { LabelTuple, LabelVisibility } from '@ureeka-notebook/web-service';

import { collectionRoute } from 'shared/routes';

import { CollectionListItemMenu } from './CollectionListItemMenu';
import { getReadableLabelVisibility } from 'label/type';

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

        <Flex
          overflow='hidden'
          whiteSpace='nowrap'
          alignItems='center'
          color='#CCC'
          fontSize='13px'
          fontWeight={500}
        >

          {obj.visibility === LabelVisibility.Public ? <TbWorld /> : <HiLockClosed />}
          <Text marginLeft={1} color='#999' fontWeight={600}>
            {getReadableLabelVisibility(obj.visibility)}
          </Text>

          {obj.description && (
            <>
              <Box width='4px' height='4px' marginX={1} marginTop='2px' background='currentColor' borderRadius='4px' />
              <Text
                flex='1 1'
                minWidth='0'
                color='#999'
                fontWeight={600}
                textOverflow='ellipsis'
                overflow='hidden'
              >
                {obj.description}
              </Text>
            </>
          )}
        </Flex>
      </Box>

      <CollectionListItemMenu labelTuple={labelTuple} />
    </Flex>
  );
};

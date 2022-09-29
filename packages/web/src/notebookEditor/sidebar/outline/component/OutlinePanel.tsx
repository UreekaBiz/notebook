import { Flex, Text } from '@chakra-ui/react';

import { Outline } from './Outline';

// ********************************************************************************
export const OutlinePanel: React.FC = () => {
  return (
    <Flex height='100%' flexDirection='column'>
      <Flex
        align='center'
        justify='space-between'
        width='100%'
        paddingX={4}
        paddingY={2}
        backgroundColor={'#f3f3f3'}
        boxShadow='base'
      >
        <Text
          paddingY={0.1}
          fontSize={15}
          fontWeight='bold'
          textTransform='capitalize'
        >
          Outline
        </Text>
      </Flex>
      <Outline />
    </Flex>
  );
};

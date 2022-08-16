import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { BsBook } from 'react-icons/bs';

import { AuthAvatar } from 'authUser/component/AuthAvatar';

// ********************************************************************************
export const HomeHeader: React.FC = () => {
  return (
    <Box width='full' borderBottom='1px solid #ccc'>
      <Flex
        alignItems='center'
        justifyContent='space-between'
        marginX='auto'
        width='full'
        maxWidth={1000}
        height={20}
      >
        <Flex alignItems='center'>
          <BsBook size={24} />
          <Heading marginLeft={2} fontSize={24}>Notebook</Heading>
        </Flex>
        <Flex alignItems='center'>
          <Text marginRight={6} color='#555' fontSize={16} fontWeight={500}>Features</Text>
          <Text marginRight={6} color='#555' fontSize={16} fontWeight={500}>About</Text>
          <Text marginRight={6} color='#555' fontSize={16} fontWeight={500}>GitHub</Text>
          <AuthAvatar buttonSize='sm' />
        </Flex>
      </Flex>
    </Box>
  );
};

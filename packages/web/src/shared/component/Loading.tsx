import { Flex, Spinner } from '@chakra-ui/react';

// ********************************************************************************
export const Loading = () =>  (
  <Flex alignItems='center' justifyContent='center' width='full' height='full'>
    <Spinner/>
  </Flex>
);

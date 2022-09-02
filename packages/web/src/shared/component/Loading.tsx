import { Flex, Spinner } from '@chakra-ui/react';

// ********************************************************************************
/** displays a loading indicator after 300ms */
export const Loading = () =>  (
  <Flex

    className='lazy-shown' // SEE: index.css
    alignItems='center'
    justifyContent='center'
    width='full'
    height='full'
  >
    <Spinner />
  </Flex>
);

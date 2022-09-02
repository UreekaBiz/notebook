import { Flex, Spinner } from '@chakra-ui/react';

// ********************************************************************************
/** displays a loading indicator after 1s */
// NOTE: this is useful when loading content async that requires a loading
//       indicator but the loading time is so short that it is not worth displaying
//       the loading indicator instantly.
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

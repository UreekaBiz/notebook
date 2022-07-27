import { Box } from '@chakra-ui/react';

import { AuthAvatar } from 'authUser/component/AuthAvatar';
import { WrappedPage } from 'core/wrapper';
import { HeroBanner } from 'ui/HeroBanner';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function HomePage() {
  return (
    <Box position='relative'>
      <HeroBanner />
      <Box position='absolute' top={4} right={4}>
        <AuthAvatar avatarSize='md' buttonSize='sm' />
      </Box>
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = HomePage;
      Page.wrappers = [/*no wrappers*/];

export default Page;

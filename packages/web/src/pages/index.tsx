import { Box } from '@chakra-ui/react';

import { WrappedPage } from 'core/wrapper';
import { HeroBanner } from 'ui/HeroBanner';
import { HomeTopbar } from 'ui/HomeTopbar';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function HomePage() {
  return (
    <Box position='relative'>
      <HomeTopbar />
      <HeroBanner />
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = HomePage;
      Page.wrappers = [/*no wrappers*/];

export default Page;

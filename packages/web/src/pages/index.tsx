import { Box } from '@chakra-ui/react';

import { WrappedPage } from 'core/wrapper';
import { HeroBanner } from 'ui/HeroBanner';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function HomePage() {
  return (
    <Box>
      <HeroBanner />
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = HomePage;
      Page.wrappers = [/*no wrappers*/];

export default Page;

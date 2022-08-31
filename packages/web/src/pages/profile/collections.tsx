import { Box, Flex, Heading } from '@chakra-ui/react';

import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { ProfileNavigationLayout } from 'shared/layout/ProfileNavigationLayout';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function APIKeyPage() {
  return (
    <Box>
      <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
        <Heading flex='1 1'>Collections</Heading>
      </Flex>
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = APIKeyPage;
      Page.wrappers = [RequiredAuthUserWrapper, UserProfileServiceWrapper, NotebookServiceWrapper, ProfileNavigationLayout]/*outer to inner order*/;

export default Page;

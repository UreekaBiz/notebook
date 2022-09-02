import { Box, Flex, Heading } from '@chakra-ui/react';

import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { LabelServiceWrapper } from 'label/LabelServiceWrapper';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { ProfileNavigationLayout } from 'shared/layout/ProfileNavigationLayout';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function HashtagsPage() {
  return (
    <Box>
      <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
        <Heading flex='1 1'>Hashtags</Heading>
      </Flex>
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = HashtagsPage;
      Page.wrappers = [RequiredAuthUserWrapper, UserProfileServiceWrapper, NotebookServiceWrapper, LabelServiceWrapper, ProfileNavigationLayout]/*outer to inner order*/;

export default Page;

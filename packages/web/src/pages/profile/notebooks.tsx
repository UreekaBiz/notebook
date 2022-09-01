import { Box, Flex, Heading } from '@chakra-ui/react';

import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { LabelServiceWrapper } from 'label/LabelServiceWrapper';
import { NotebookList } from 'notebook/component/NotebookList';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { ProfileNavigationLayout } from 'shared/layout/ProfileNavigationLayout';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function NotebooksPage() {
  return (
    <Box paddingBottom='40px'>
      <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
        <Heading flex='1 1'>Notebooks</Heading>
      </Flex>
      <NotebookList />
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = NotebooksPage;
      Page.wrappers = [RequiredAuthUserWrapper, UserProfileServiceWrapper, NotebookServiceWrapper, LabelServiceWrapper, ProfileNavigationLayout]/*outer to inner order*/;

export default Page;

import { Box, Button, Flex, Heading } from '@chakra-ui/react';

import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { CollectionDialog } from 'label/component/CollectionDialog';
import { CollectionList } from 'label/component/CollectionList';
import { LabelServiceWrapper } from 'label/LabelServiceWrapper';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { ProfileNavigationLayout } from 'shared/layout/ProfileNavigationLayout';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function CollectionsPage() {
  return (
    <Box>
      <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
        <Heading flex='1 1'>Collections</Heading>
        <CollectionDialog type='create' component={(onClick) => (
          <Button colorScheme='blue' onClick={onClick}>Create Collection</Button>
        )}
        />
      </Flex>
      <CollectionList />
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = CollectionsPage;
      Page.wrappers = [RequiredAuthUserWrapper, UserProfileServiceWrapper, NotebookServiceWrapper, LabelServiceWrapper, ProfileNavigationLayout]/*outer to inner order*/;

export default Page;

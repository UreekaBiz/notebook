import { Box, Flex, Heading } from '@chakra-ui/react';

import { LabelIdentifier } from '@ureeka-notebook/web-service';

import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { LabelServiceWrapper } from 'label/LabelServiceWrapper';
import { useRouter } from 'next/router';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { ProfileNavigationLayout } from 'shared/layout/ProfileNavigationLayout';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function CollectionIdPage() {
  // get the notebookId from the URL
  // NOTE: the effect(s) below handle if the notebookId is not found
  const router = useRouter();
  const { collectionId } = router.query as { collectionId: LabelIdentifier; }/*FIXME: follow a paradigm like in [publishedNotebookId].tsx*/;

  return (
    <Box>
      <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
        <Heading flex='1 1'>Collection {collectionId} </Heading>
      </Flex>
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = CollectionIdPage;
      Page.wrappers = [RequiredAuthUserWrapper, UserProfileServiceWrapper, NotebookServiceWrapper, LabelServiceWrapper, ProfileNavigationLayout]/*outer to inner order*/;

export default Page;

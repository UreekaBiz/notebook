
import { Flex } from '@chakra-ui/react';

import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { NotebookList } from 'notebook/component/NotebookList';
import { NotebookTopBar } from 'notebook/component/NotebookTopBar';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';

import { FullPageLayout } from 'shared/layout/FullPageLayout';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function NotebookListPage() {
  return (
    <FullPageLayout>
      <Flex alignItems='center' flexDir='column' justifyContent='flex-start' height='full'>
        <NotebookTopBar />
        <NotebookList />
      </Flex>
    </FullPageLayout>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = NotebookListPage;
      Page.wrappers = [RequiredAuthUserWrapper, NotebookServiceWrapper]/*outer to inner order*/;

export default Page;

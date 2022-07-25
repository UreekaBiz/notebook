import { Button, Flex, Heading, Text } from '@chakra-ui/react';

import { APIKeyTable } from 'authUser/settings/APIKeyTable';
import { APIKeyDialog } from 'authUser/settings/APIKeyDialog';
import { SettingsLayoutWrapper } from 'authUser/settings/SettingsLayoutWrapper';
import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { NotebookTopBar } from 'notebook/component/NotebookTopBar';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function APIKeyPage() {
  return (
    <Flex flexDirection='column' alignItems='center' justifyContent='center'>
      <NotebookTopBar/>
      {/* FIXME: Use layout wrapper in WrapperPage wrappers */}
      <SettingsLayoutWrapper>
        <Text>Settings</Text>
        <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
          <Heading flex='1 1'>API Keys</Heading>
          <APIKeyDialog
            button={({ onClick }) => <Button colorScheme='blue' onClick={onClick}>New API Key</Button>}
          />
        </Flex>
        <APIKeyTable />
      </SettingsLayoutWrapper>
    </Flex>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = APIKeyPage;
      Page.wrappers = [RequiredAuthUserWrapper, NotebookServiceWrapper]/*outer to inner order*/;

export default Page;

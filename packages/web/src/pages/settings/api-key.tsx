import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';

import { APIKeyTable } from 'authUser/settings/APIKeyTable';
import { APIKeyDialog } from 'authUser/settings/APIKeyDialog';
import { SettingsLayoutWrapper } from 'authUser/settings/SettingsLayoutWrapper';
import { RequiredAuthUserWrapper } from 'authUser/RequiredAuthUserWrapper';
import { WrappedPage } from 'core/wrapper';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { ProfileNavigationLayout } from 'shared/layout/ProfileNavigationLayout';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';
import { LabelServiceWrapper } from 'label/LabelServiceWrapper';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function APIKeyPage() {
  return (
    <Box>
      <Text>Settings</Text>
      <Flex alignItems='center' justifyContent='space-between' width='full' marginBottom={4}>
        <Heading flex='1 1'>API Keys</Heading>
        <APIKeyDialog
          button={({ onClick }) => <Button colorScheme='blue' onClick={onClick}>New API Key</Button>}
        />
      </Flex>
      <APIKeyTable />
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = APIKeyPage;
      Page.wrappers = [RequiredAuthUserWrapper, UserProfileServiceWrapper, NotebookServiceWrapper, LabelServiceWrapper, ProfileNavigationLayout, SettingsLayoutWrapper]/*outer to inner order*/;

export default Page;

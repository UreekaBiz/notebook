import { Box, Flex } from '@chakra-ui/react';

import { WrappedPage } from 'core/wrapper';
import { PublishedNotebookList } from 'notebook/component/PublishedNotebookList';
import { NotebookServiceWrapper } from 'notebook/NotebookServiceWrapper';
import { HeroBanner } from 'ui/HeroBanner';
import { HomeTopbar } from 'ui/HomeTopbar';
import { UserProfileServiceWrapper } from 'user/UserProfileServiceWrapper';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function HomePage() {
  return (
    <Box position='relative'>
      <HomeTopbar />
      <HeroBanner />
      <Box width='full' borderBottom='1px solid #eaeaea' marginBottom={4}/>
      <Box
        width='full'
        maxWidth={1000}
        marginX='auto'
        paddingY={16}
      >
        <Flex>
          <Box flex='1 1'/*take remaining space*/ marginRight={8}>
            <PublishedNotebookList />
          </Box>
          {/** WIP: empty box for now*/}
          <Box width={400} height={200}/>
        </Flex>

      </Box>
    </Box>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = HomePage;
      Page.wrappers = [UserProfileServiceWrapper, NotebookServiceWrapper];

export default Page;

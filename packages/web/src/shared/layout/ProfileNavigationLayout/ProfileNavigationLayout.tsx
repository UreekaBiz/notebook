import { Box, Flex } from '@chakra-ui/react';

import { NotebookTopBar } from 'notebook/component/NotebookTopBar';

import { ProfileNavigation } from './ProfileNavigation';

// ********************************************************************************
interface Props {
  children: React.ReactNode;
}
export const ProfileNavigationLayout: React.FC<Props> = ({ children }) => {
  return (
    <Flex flexDirection='column' alignItems='center' justifyContent='center'>
      <NotebookTopBar />
      <Flex alignItems='stretch' width='100%' maxWidth='1200px' paddingTop={16}>
        <Box width={150} marginRight={24}>
          <ProfileNavigation/>
        </Box>
        <Box flex='1 1'/*use remaining space*/>{children}</Box>
      </Flex>
    </Flex>
  );
};

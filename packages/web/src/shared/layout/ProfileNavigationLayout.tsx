import { Box, Flex } from '@chakra-ui/react';

import { NotebookTopBar } from 'notebook/component/NotebookTopBar';

// ********************************************************************************
interface Props {
  children: React.ReactNode;
}
export const ProfileNavigationLayout: React.FC<Props> = ({ children }) => {
  return (
    <Flex flexDirection='column' alignItems='center' justifyContent='center'>
      <NotebookTopBar />
      <Flex alignItems='stretch' width='100%' maxWidth='1200px' paddingTop={10}>
        <Box width={150} height='auto' marginRight={24} background='red' />
        <Box flex='1 1'/*use remaining space*/>{children}</Box>
      </Flex>
    </Flex>
  );
};

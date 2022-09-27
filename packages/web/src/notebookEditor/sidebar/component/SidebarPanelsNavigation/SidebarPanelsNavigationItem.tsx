import { Box, BoxProps, Text } from '@chakra-ui/react';

import { getReadableSidebarPanel, SidebarPanel } from 'notebookEditor/sidebar/type';

// ********************************************************************************
interface Props extends BoxProps {
  panel: SidebarPanel;

  isActive?: boolean;
}
export const SidebarPanelsNavigationItem: React.FC<Props> = ({ panel, isActive, ...props }) => {
  return (
    <Box
      marginX='2px'
      padding='2px 8px'
      paddingBottom={isActive ? '6px' : undefined}
      background={isActive ? '#EAEAEA' : '#F3F3F3'}
      borderRadius='8px 8px 0 0'
      border='1px solid'
      borderColor='gray.300'
      fontSize='12px'
      fontColor='#333'
      fontWeight='500'
      transition='all 0.2s'
      _hover={{
        cursor: 'pointer',
      }}
      {...props}
    >
      <Text>{getReadableSidebarPanel(panel)}</Text>
    </Box>
  );
};

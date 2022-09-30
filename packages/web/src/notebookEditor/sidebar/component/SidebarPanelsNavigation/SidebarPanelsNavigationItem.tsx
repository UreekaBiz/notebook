import { Box, BoxProps } from '@chakra-ui/react';
import { ReactElement } from 'react';

import { SidebarPanel } from 'notebookEditor/sidebar/type';

// ********************************************************************************
interface Props extends BoxProps {
  panel: SidebarPanel;

  icon: ReactElement;

  isActive?: boolean;
}
export const SidebarPanelsNavigationItem: React.FC<Props> = ({ panel, icon, isActive, ...props }) => {
  return (
    <Box
      marginX='2px'
      padding='2px 8px'
      transition='all 0.2s'
      color={isActive ? '#EEE': '#AAA'}
      _hover={{
        cursor: 'pointer',
      }}
      {...props}
    >
      {icon}
    </Box>
  );
};

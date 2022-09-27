import { Flex } from '@chakra-ui/react';

import { SidebarPanel } from 'notebookEditor/sidebar/type';

import { SidebarPanelsNavigationItem } from './SidebarPanelsNavigationItem';

// ********************************************************************************
interface Props {
  value: SidebarPanel;
  onChange: (value: SidebarPanel) => void;
}
export const SidebarPanelsNavigation: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Flex alignItems='flex-end'>
      {Object.values(SidebarPanel).map((panel) => (
        <SidebarPanelsNavigationItem
          key={panel}
          panel={panel}
          isActive={value === panel}
          onClick={() => onChange(panel)}
        />
      ))}
    </Flex>
  );
};

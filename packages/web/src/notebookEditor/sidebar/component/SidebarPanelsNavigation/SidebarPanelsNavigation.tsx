import { Flex, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { CgList } from 'react-icons/cg';

import { getReadableSidebarPanel, SidebarPanel } from 'notebookEditor/sidebar/type';

// ********************************************************************************
type Panel = {
  panel: SidebarPanel;

  label: string;
  icon: ReactElement;
};

const panels: Panel[] = [
  {
    panel: SidebarPanel.Toolbar,

    label: getReadableSidebarPanel(SidebarPanel.Toolbar),
    icon: <AiOutlineEdit/>,
  },
  {
    panel: SidebarPanel.Outline,

    label: getReadableSidebarPanel(SidebarPanel.Outline),
    icon: <CgList/>,
  },
];

// ********************************************************************************
interface Props {
  value: SidebarPanel;
  onChange: (value: SidebarPanel) => void;
}
export const SidebarPanelsNavigation: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Flex
      justifyContent='space-between'
      gap='8px'
      paddingX='8px'
      boxShadow='inner'
    >
      {panels.map(({ panel, icon, label }) => {
        const isActive = panel === value;
        return (
          <Flex
            key={panel}
            direction='column'
            alignItems='center'
            justifyContent='center'
            flex='1 1'
            height='60px'
            color={isActive ? '#1967D2' : '#666'}
            fontSize='18px'
            _hover={{
              cursor: 'pointer',
              color: isActive ? '#1967D2' : '#333',
            }}
            onClick={() => onChange(panel)}
          >
            {icon}
            <Text fontSize='12px' fontWeight='700' >
              {label}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

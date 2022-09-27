import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { OutlinePanel } from '../outline/OutlinePanel';
import { ToolbarPanel } from '../toolbar/component/ToolbarPanel';
import { SidebarPanel } from '../type';
import { Debugger } from './Debugger';
import { SidebarPanelsNavigation } from './SidebarPanelsNavigation';
import { SidebarTopbar } from './SidebarTopbar';

const Panels: Record<SidebarPanel, React.FC> = {
  [SidebarPanel.Toolbar]: ToolbarPanel,
  [SidebarPanel.Outline]: OutlinePanel,
};

// ********************************************************************************
export const SideBar = () => {
  // == State =====================================================================
  const [panel, setPanel] = useState<SidebarPanel>(SidebarPanel.Toolbar/*default*/);
  const [showDebugger, setShowDebugger] = useState(false);

  // == Effect ====================================================================
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const isSequence = e.ctrlKey && e.altKey && e.code === 'Period';
      if(!isSequence) return/*nothing to do*/;

      setShowDebugger(prevValue => !prevValue);
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // == Handler ===================================================================
  const handlePanelChange = (panel: SidebarPanel) => {
    setPanel(panel);
  };

  // == UI ========================================================================
  const Panel = Panels[panel];
  return (
    <Flex
      flexDirection='column'
      width='100%'
      height='100%'
      minHeight={0}
      overflow='hidden'
      background='#FCFCFC'
      borderLeft='1px solid'
      borderColor='gray.300'
    >
      <SidebarTopbar background='#f3f3f3' />
      <Box flex='1 1' minHeight='0'>
        <Panel />
      </Box>
      <SidebarPanelsNavigation value={panel} onChange={handlePanelChange} />
      {showDebugger && <Debugger />}
    </Flex>
  );
};

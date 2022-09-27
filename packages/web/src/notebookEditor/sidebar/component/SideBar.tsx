import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { ToolbarPanel } from '../toolbar/component/ToolbarPanel';
import { Debugger } from './Debugger';
import { SidebarTopbar } from './SidebarTopbar';

// ********************************************************************************
export const SideBar = () => {
  // == State =====================================================================
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

  // == UI ========================================================================
  return (
    <Flex
      flexDir='column'
      width='100%'
      height='100%'
      minHeight={0}
      overflow='hidden'
      background='#FCFCFC'
      borderLeft='1px solid'
      borderColor='gray.300'
    >
      <SidebarTopbar background='#f3f3f3' />
      <ToolbarPanel />
      {showDebugger && <Debugger />}
    </Flex>
  );
};

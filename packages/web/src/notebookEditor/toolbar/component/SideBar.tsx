import { Divider, Flex, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAllAscendantsFromSelection } from 'notebookEditor/extension/util/node';
import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';
import { SelectionDepth } from 'notebookEditor/model/type';

import { Debugger } from './Debugger';
import { SideBarHeading } from './SideBarHeading';
import { Toolbar } from './Toolbar';
import { ToolbarBreadcrumbs } from './ToolbarBreadcrumbs';

// ********************************************************************************
export const SideBar = () => {
  // == State =====================================================================
  const [showDebugger, setShowDebugger] = useState(false);
  const [selectedDepth, setSelectedDepth] = useState<SelectionDepth | undefined/*current node*/>(undefined);
  const editor = useValidatedEditor();

  // == Effects ===================================================================
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

  // == Handlers ==================================================================
  const handleDepthSelection = useCallback((depth: SelectionDepth) => { setSelectedDepth(depth); }, []);

  // == UI ========================================================================
 // Create a toolbar for each ascendant node on the current selection.
  const Toolbars = useMemo(() => {
    const ascendantsNodes = getAllAscendantsFromSelection(editor.state);
    return ascendantsNodes.map((node, i) => {
      if(!node) return undefined;
      const depth = i === 0 ? undefined/*leaf node*/ : ascendantsNodes.length - i - 1;
      return (<Toolbar key={i} depth={depth} node={node} onSelection={handleDepthSelection} selectedDepth={selectedDepth} />);
    });
  }, [editor.state, handleDepthSelection, selectedDepth]);

  return (
    <Flex flexDir='column' minH={0} width='100%' height='100%' background='#FCFCFC' borderLeft='1px solid' borderColor='gray.300' overflow='hidden'>
      <SideBarHeading background='#F3F3F3' />
      <ToolbarBreadcrumbs onSelection={handleDepthSelection} selectedDepth={selectedDepth} />
      <Flex flexDir='column' flex='1 1'>
        <VStack divider={<Divider />} spacing={0} flex='1 1 0' alignItems='stretch' overflowY='scroll'>
          {Toolbars}
        </VStack>
        {showDebugger && <Debugger/>}
      </Flex>
    </Flex>
  );
};

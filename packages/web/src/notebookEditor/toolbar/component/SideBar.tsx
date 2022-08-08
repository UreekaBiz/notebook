import { Divider, Flex, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getMarkName, getNodeName } from '@ureeka-notebook/web-service';

import { NotebookTopBar } from 'notebook/component/NotebookTopBar';
import { getAllMarksFromSelection } from 'notebookEditor/extension/util/mark';
import { getAllAscendantsFromSelection } from 'notebookEditor/extension/util/node';
import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';
import { SelectionDepth } from 'notebookEditor/model/type';

import { getToolbar } from '../toolbar';
import { Debugger } from './Debugger';
import { Toolbar } from './Toolbar';
import { ToolbarBreadcrumbs } from './ToolbarBreadcrumbs';

// ********************************************************************************
export const SideBar = () => {
  // == State =====================================================================
  const [showDebugger, setShowDebugger] = useState(false);
  const [selectedDepth, setSelectedDepth] = useState<SelectionDepth | undefined/*current node*/>(undefined);
  const editor = useValidatedEditor();

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
  const handleDepthSelection = useCallback((depth: SelectionDepth) => { setSelectedDepth(depth); }, []);

  // == UI ========================================================================
  // Create a toolbar for each ascendant node on the current selection.
  const Toolbars = useMemo(() => {
    const toolbars: JSX.Element[] = [];

    // Create a toolbar for each mark on the current selection
    // NOTE: Order matters.
    const marks = getAllMarksFromSelection(editor.state);
    marks.forEach((mark, i) => {
      if(!mark) return undefined/*nothing to do*/;

      const markName = getMarkName(mark);
      const toolbar = getToolbar(markName);
      // Only render toolbar if it exists and allows it with shouldShow
      if(!toolbar || (toolbar.shouldShow && !toolbar.shouldShow(editor, undefined))) return/*nothing to do*/;

      toolbars.push(<Toolbar
                      key={`mark-toolbar-${i}`}
                      depth={undefined}
                      nodeOrMarkName={markName}
                      selectedDepth={selectedDepth}
                      toolbar={toolbar}
                      onSelection={handleDepthSelection}
                    />);
      return;
    });

    const ascendantsNodes = getAllAscendantsFromSelection(editor.state);

    // Create a toolbar for each ascendant node.
    ascendantsNodes.forEach((node, i) => {
      if(!node) return undefined/*nothing to do*/;

      const depth = i === 0 ? undefined/*leaf node*/ : ascendantsNodes.length - i - 1;
      const nodeName = getNodeName(node);
      const toolbar = getToolbar(nodeName);
      // Only render toolbar if it exists and allows it with shouldShow
      if(!toolbar || (toolbar.shouldShow && !toolbar.shouldShow(editor, undefined))) return/*nothing to do*/;

      toolbars.push(<Toolbar
                      key={`node-toolbar-${i}`}
                      depth={depth}
                      nodeOrMarkName={nodeName}
                      selectedDepth={selectedDepth}
                      toolbar={toolbar}
                      onSelection={handleDepthSelection}
                    />);
      return/*nothing else to do*/;
    });
    return toolbars;
  }, [editor, handleDepthSelection, selectedDepth]);

  return (
    <Flex flexDir='column' minH={0} width='100%' height='100%' background='#FCFCFC' borderLeft='1px solid' borderColor='gray.300' overflow='hidden'>
      <NotebookTopBar background='#f3f3f3' />
      <ToolbarBreadcrumbs onSelection={handleDepthSelection} selectedDepth={selectedDepth} />
      <Flex flexDir='column' flex='1 1'>
        <VStack divider={<Divider />} spacing={0} flex='1 1 0' alignItems='stretch' overflowY='scroll'>
          {Toolbars}
        </VStack>
        {showDebugger && <Debugger />}
      </Flex>
    </Flex>
  );
};

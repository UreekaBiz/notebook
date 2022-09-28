import { Divider, Flex, VStack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';

import { getAllAscendantsFromSelection, getMarkName, getNodeName, SelectionDepth } from '@ureeka-notebook/web-service';

import { Toolbar } from 'notebookEditor/sidebar/toolbar/component/Toolbar';
import { getAllMarksFromSelection } from 'notebookEditor/extension/util/mark';
import { ToolbarBreadcrumbs } from 'notebookEditor/sidebar/toolbar/component/ToolbarBreadcrumbs';
import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';

import { getToolbar } from '../../toolbar/toolbar';

// ********************************************************************************
export const ToolbarPanel = () => {
  // == State =====================================================================
  const [selectedDepth, setSelectedDepth] = useState<SelectionDepth | undefined/*current node*/>(undefined);
  const editor = useValidatedEditor();

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

      toolbars.push(
        <Toolbar
          key={`mark-toolbar-${i}`}
          depth={undefined}
          nodeOrMarkName={markName}
          selectedDepth={selectedDepth}
          toolbar={toolbar}
          onSelection={handleDepthSelection}
        />
      );
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

      toolbars.push(
        <Toolbar
          key={`node-toolbar-${depth}`}
          depth={depth}
          nodeOrMarkName={nodeName}
          selectedDepth={selectedDepth}
          toolbar={toolbar}
          onSelection={handleDepthSelection}
        />
      );
      return/*nothing else to do*/;
    });
    return toolbars;
    // NOTE: This value depend on the editor state but it's not being explicitly
    //       used.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, editor.state, handleDepthSelection, selectedDepth]);

  return (
    <Flex flex='1 1' flexDirection='column'>
      <ToolbarBreadcrumbs onSelection={handleDepthSelection} selectedDepth={selectedDepth} />
      <Flex flexDir='column' flex='1 1'>
        <VStack divider={<Divider />} spacing={0} flex='1 1 0' alignItems='stretch' overflowY='scroll'>
          {Toolbars}
        </VStack>
      </Flex>
    </Flex>
  );
};

import { AiOutlineClockCircle } from 'react-icons/ai';

import { isAsyncNode, NodeName } from '@ureeka-notebook/web-service';

import { selectionIsOfType } from 'notebookEditor/extension/util/node';
import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { DemoAsyncNodeChipSelector } from './DemoAsyncNodeChipSelector';
import { DemoAsyncNodeDelaySlider } from './DemoAsyncNodeDelaySlider';
import { ExecuteDemoAsyncNodeButton } from './ExecuteDemoAsyncNodeButton';

//*********************************************************************************
// == Tool Items ==================================================================
export const demoAsyncNodeToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.DEMO_ASYNC_NODE,
  label: NodeName.DEMO_ASYNC_NODE,

  icon: <AiOutlineClockCircle size={16} />,
  tooltip: 'DemoAsyncNode (⌘ + ⌥ + D)',

  // disable tool item if current selected node or its parent is a CodeBlock node
  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(selectionIsOfType(selection, NodeName.DEMO_ASYNC_NODE)) return true;

    const parentNode = selection.$anchor.parent;
    if(isAsyncNode(parentNode)) return true;

    return false;
  },
  onClick: (editor) => editor.chain().focus().insertDemoAsyncNode().run(),
};

const demoAsyncNodeDelayTool: ToolItem = {
  toolType: 'component',
  name: 'demoAsyncNodeDelayTool',

  component: DemoAsyncNodeDelaySlider,
  shouldShow: (editor) => selectionIsOfType(editor.state.selection, NodeName.DEMO_ASYNCNODE),
};

const demoAsyncNodeChipTool: ToolItem = {
  toolType: 'component',
  name: 'demoAsyncNodeChipTool',

  component: DemoAsyncNodeChipSelector,
  shouldShow: (editor) => selectionIsOfType(editor.state.selection, NodeName.DEMO_ASYNCNODE),
};

// == Toolbar =====================================================================
export const DemoAsyncNodeToolbar: Toolbar = {
  title: 'Demo Async Node',
  name: NodeName.DEMO_ASYNCNODE,
  rightContent: ExecuteDemoAsyncNodeButton,
  toolsCollections: [
    [
      demoAsyncNodeDelayTool,
      demoAsyncNodeChipTool,
    ],
  ],
};

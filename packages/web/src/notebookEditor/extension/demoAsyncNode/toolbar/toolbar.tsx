import { AiOutlineClockCircle } from 'react-icons/ai';

import { isAsyncNode, getSelectedNode, isDemoAsyncNode, NodeName } from '@ureeka-notebook/web-service';

import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { DemoAsyncNodeChipSelector } from './DemoAsyncNodeChipSelector';
import { DemoAsyncNodeDelaySlider } from './DemoAsyncNodeDelaySlider';
import { ExecuteButtons } from './ExecuteButtons';

//*********************************************************************************
// == Tool Items ==================================================================
// disable tool item if current selected node or its parent is a CodeBlock node
export const demoAsyncNodeToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.DEMO_ASYNC_NODE,
  label: NodeName.DEMO_ASYNC_NODE,

  icon: <AiOutlineClockCircle size={16} />,
  tooltip: 'DemoAsyncNode (⌘ + ⌥ + D)',

  shouldBeDisabled: (editor) => {
    const node = getSelectedNode(editor.state);
    const { selection } = editor.state;
    if(node && isDemoAsyncNode(node)) return true/*(SEE: comment above)*/;

    const parentNode = selection.$anchor.parent;
    if(isAsyncNode(parentNode)) return true/*(SEE: comment above)*/;

    return false/*enabled*/;
  },
  onClick: (editor) => editor.chain().focus().insertDemoAsyncNode().run(),
};

const demoAsyncNodeDelayTool: ToolItem = {
  toolType: 'component',
  name: 'demoAsyncNodeDelayTool',

  component: DemoAsyncNodeDelaySlider,
  shouldShow: (editor) => {
    const node = getSelectedNode(editor.state);
    if(node && isDemoAsyncNode(node)) return true/*(SEE: comment above)*/;

    return false/*enabled*/;
  },
};

const demoAsyncNodeChipTool: ToolItem = {
  toolType: 'component',
  name: 'demoAsyncNodeChipTool',

  component: DemoAsyncNodeChipSelector,
  shouldShow: (editor) => {
    const node = getSelectedNode(editor.state);
    if(node && isDemoAsyncNode(node)) return true/*(SEE: comment above)*/;

    return false/*enabled*/;
  },
};

// == Toolbar =====================================================================
export const DemoAsyncNodeToolbar: Toolbar = {
  title: 'Demo Async Node',
  name: NodeName.DEMO_ASYNC_NODE,
  rightContent: ExecuteButtons,
  toolsCollections: [
    [
      demoAsyncNodeDelayTool,
      demoAsyncNodeChipTool,
    ],
  ],
};

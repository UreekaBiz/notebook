import { AiOutlineClockCircle } from 'react-icons/ai';

import { generateNodeId, getSelectedNode, isAsyncNode, isDemoAsyncNode, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { CodeBlockReferencesChipSelector } from 'notebookEditor/extension/codeblock/toolbar/CodeBlockReferencesChipSelector';
import { SliderToolItem } from 'notebookEditor/extension/shared/component/SliderToolItem';
import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';
import { focusChipToolInput } from 'notebookEditor/util';

import { ExecuteButtons } from './ExecuteButtons';

//*********************************************************************************
// == Tool Items ==================================================================
// disable tool item if current selected node or its parent is a CodeBlock node
export const demoAsyncNodeToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.DEMO_ASYNC_NODE,
  label: NodeName.DEMO_ASYNC_NODE,

  icon: <AiOutlineClockCircle size={16} />,
  tooltip: 'Demo Async Node (⌘ + ⌥ + D)',

  shouldBeDisabled: (editor) => {
    const node = getSelectedNode(editor.state);
    const { selection } = editor.state;
    if(node && isDemoAsyncNode(node)) return true/*(SEE: comment above)*/;

    const parentNode = selection.$anchor.parent;
    if(isAsyncNode(parentNode)) return true/*(SEE: comment above)*/;

    return false/*enabled*/;
  },
  onClick: (editor) => {
    const id = generateNodeId();
    editor.chain().focus().insertDemoAsyncNode({ id }).run();
    focusChipToolInput(id);
  },
};

const demoAsyncNodeDelayTool: ToolItem = {
  toolType: 'component',
  name: 'demoAsyncNodeDelayTool',

  component: (props) =>
    <SliderToolItem
      {...props}
      name='Delay (ms)'
      attributeType={AttributeType.Delay}
      nodeName={NodeName.DEMO_ASYNC_NODE}
      minValue={0}
      maxValue={4000}
      step={50}
      fixedDecimals={1}
    />,
};

const demoAsyncNodeChipTool: ToolItem = {
  toolType: 'component',
  name: 'demoAsyncNodeChipTool',

  component: (props) =>
    <CodeBlockReferencesChipSelector
      {...props}
      nodeName={NodeName.DEMO_ASYNC_NODE}
    />,
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

import { MdFindReplace } from 'react-icons/md';

import { createBlockNode, generateNodeId, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { fontSizeToolItem, spacingToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { toolItemCommandWrapper } from 'notebookEditor/extension/util/command';
import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { ExecuteButtons } from './ExecuteButtons';
import { SliderToolItem } from 'notebookEditor/extension/shared/component/SliderToolItem';
import { InputToolItem } from 'notebookEditor/extension/shared/component/InputToolItem';

//*********************************************************************************
// == Tool Items ==================================================================
export const demo2AsyncNodeToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.DEMO_2_ASYNC_NODE,
  label: NodeName.DEMO_2_ASYNC_NODE,

  icon: <MdFindReplace size={16} />,
  tooltip: 'Demo 2 Async Node (⌘ + ⇧ + ⌥ + D)',

  shouldBeDisabled: () => false,
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, createBlockNode(NodeName.DEMO_2_ASYNC_NODE, { [AttributeType.Id]: generateNodeId() })),
};

const demo2AsyncNodeReplaceTextToolItem: ToolItem = {
  toolType: 'component',
  name: 'demo2AsyncNodeReplaceTextToolItem',

  component: (props) =>
    <InputToolItem
      {...props}
      name='Replace Text'
      attributeType={AttributeType.TextToReplace}
      nodeName={NodeName.DEMO_2_ASYNC_NODE}
    />,
};

const demo2AsyncNodeDelaySlider: ToolItem = {
  toolType: 'component',
  name: 'demo2AsyncNodeDelaySlider',

  component: (props) =>
    <SliderToolItem
      {...props}
      name='Delay (ms)'
      attributeType={AttributeType.Delay}
      nodeName={NodeName.DEMO_2_ASYNC_NODE}
      minValue={0}
      maxValue={4000}
      step={50}
      fixedDecimals={1}
    />,
};

// == Toolbar =====================================================================
export const Demo2AsyncNodeToolbar: Toolbar = {
  title: 'Demo 2 Async Node',
  name: NodeName.DEMO_2_ASYNC_NODE/*Expected and guaranteed to be unique.*/,
  rightContent: ExecuteButtons,

  toolsCollections: [
    [
      demo2AsyncNodeReplaceTextToolItem,
      demo2AsyncNodeDelaySlider,
    ],
    [
      markBold,
      markStrikethrough,
    ],
    [
      fontSizeToolItem,
      textColorToolItem,
    ],
    [
      spacingToolItem,
    ],
  ],
};

import { MdFindReplace } from 'react-icons/md';

import { createBlockNode, generateNodeId, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { fontSizeToolItem, spacingToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { shortcutCommandWrapper } from 'notebookEditor/extension/util/command';
import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { Demo2AsyncNodeDelaySlider } from './Demo2AsyncNodeDelaySlider';
import { Demo2AsyncNodeReplaceTextToolItem } from './Demo2AsyncNodeReplaceTextToolItem';
import { ExecuteButtons } from './ExecuteButtons';

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
  onClick: (editor) => shortcutCommandWrapper(editor, createBlockNode(NodeName.CODEBLOCK, { [AttributeType.Id]: generateNodeId() })),
};

const demo2AsyncNodeReplaceTextToolItem: ToolItem = {
  toolType: 'component',
  name: 'demo2AsyncNodeReplaceTextToolItem',

  component: Demo2AsyncNodeReplaceTextToolItem,
};

const demo2AsyncNodeDelaySlider: ToolItem = {
  toolType: 'component',
  name: 'demo2AsyncNodeDelaySlider',

  component: Demo2AsyncNodeDelaySlider,
};

// == Toolbar =====================================================================
export const Demo2AsyncNodeToolbar: Toolbar = {
  title: 'Demo 2 Async Node',
  name: NodeName.DEMO_2_ASYNC_NODE/*Expected and guaranteed to be unique.*/,
  rightContent: ExecuteButtons,

  toolsCollections: [
    [
      markBold,
      markStrikethrough,
    ],
    [
      demo2AsyncNodeReplaceTextToolItem,
    ],
    [
      demo2AsyncNodeDelaySlider,
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

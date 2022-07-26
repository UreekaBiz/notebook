import { MdFindReplace } from 'react-icons/md';

import { generateNodeId, isNodeSelection, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { blockquoteToolItem } from 'notebookEditor/extension/blockquote/toolbar';
import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markCode } from 'notebookEditor/extension/code/toolbar';
import { markItalic } from 'notebookEditor/extension/italic/toolbar';
import { SliderToolItem } from 'notebookEditor/extension/shared/component/SliderToolItem';
import { InputToolItem } from 'notebookEditor/extension/shared/component/InputToolItem';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { markSubScript } from 'notebookEditor/extension/subScript/toolbar';
import { markSuperScript } from 'notebookEditor/extension/superScript/toolbar';
import { highlightColorMarkToolItem, fontSizeToolItem, spacingToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { markUnderline } from 'notebookEditor/extension/underline/toolbar';
import { toggleBlock } from 'notebookEditor/extension/util/node';
import { dedentBlocksToolItem, indentBlocksToolItem } from 'notebookEditor/shared/toolItem';
import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { ExecuteButtons } from './ExecuteButtons';

//*********************************************************************************
// == Tool Items ==================================================================
export const demo2AsyncNodeToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.DEMO_2_ASYNC_NODE,
  label: NodeName.DEMO_2_ASYNC_NODE,

  icon: <MdFindReplace size={16} />,
  tooltip: 'Demo 2 Async Node (⌘ + ⇧ + ⌥ + D)',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor) => toggleBlock(editor, NodeName.DEMO_2_ASYNC_NODE, { [AttributeType.Id]: generateNodeId() }),
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
      blockquoteToolItem,
      markBold,
      markItalic,
      markUnderline,
      markStrikethrough,
      markSuperScript,
      markSubScript,
      markCode,
      dedentBlocksToolItem,
      indentBlocksToolItem,
    ],
    [
      fontSizeToolItem,
      textColorToolItem,
      highlightColorMarkToolItem,
    ],
    [
      spacingToolItem,
    ],
  ],
};

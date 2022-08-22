import { BiCodeAlt } from 'react-icons/bi';

import { createBlockNode, generateNodeId, getParentNode, getSelectedNode, isCodeBlockNode, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { spacingToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { shortcutCommandWrapper } from 'notebookEditor/extension/util/command';
import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { CodeBlockTypeToolItem } from './CodeBlockTypeToolItem';
import { CodeBlockWrapToolItem } from './CodeBlockWrapToolItem';

//*********************************************************************************
// === Tool Items =================================================================
export const codeBlockToolItem: ToolItem = {
  toolType: 'button',

  name: NodeName.CODEBLOCK,
  label: NodeName.CODEBLOCK,

  icon: <BiCodeAlt size={16} />,
  tooltip: 'Code Block (⌘ + ⌥ + C)',

  // Disable tool item if current selected node or its parent is a CodeBlock node
  shouldBeDisabled: (editor) => {
    const node = getSelectedNode(editor.state);
    if(node && isCodeBlockNode(node)) return true/*(SEE: comment above)*/;

    if(isCodeBlockNode(editor.state.selection.$anchor.parent)) return true/*(SEE: comment above)*/;

    return false/*enabled*/;
  },
  onClick: (editor) => shortcutCommandWrapper(editor, createBlockNode(NodeName.CODEBLOCK, { [AttributeType.Id]: generateNodeId() })),
};

const codeBlockTypeToolItem: ToolItem = {
  toolType: 'component',
  name: 'codeBlockTypeToolItem',

  component: CodeBlockTypeToolItem,
  shouldShow: (editor) => isCodeBlockNode(getParentNode(editor.state.selection)),
};

const codeBlockWrapToolItem: ToolItem =  {
  toolType: 'component',
  name: 'codeBlockWrapToolItem',

  component: CodeBlockWrapToolItem,
  shouldShow: (editor) => isCodeBlockNode(getParentNode(editor.state.selection)),
};

// == Toolbar =====================================================================
export const CodeBlockToolbar: Toolbar = {
  title: 'Code Block',
  name: NodeName.CODEBLOCK,

  toolsCollections: [
    [
      markBold,
      markStrikethrough,
    ],
    [
      codeBlockTypeToolItem,
      codeBlockWrapToolItem,
    ],
    [
      spacingToolItem,
    ],
  ],
};

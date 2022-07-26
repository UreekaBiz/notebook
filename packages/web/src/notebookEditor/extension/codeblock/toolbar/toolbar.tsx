import { BiCodeAlt } from 'react-icons/bi';

import { generateNodeId, getParentNode, getSelectedNode, isCodeBlockNode, isNodeSelection, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { blockquoteToolItem } from 'notebookEditor/extension/blockquote/toolbar/toolbar';
import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markCode } from 'notebookEditor/extension/code/toolbar';
import { markItalic } from 'notebookEditor/extension/italic/toolbar';
import { CheckBoxToolItem } from 'notebookEditor/extension/shared/component/CheckBoxToolItem';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { markSubScript } from 'notebookEditor/extension/subScript/toolbar';
import { markSuperScript } from 'notebookEditor/extension/superScript/toolbar';
import { spacingToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { markUnderline } from 'notebookEditor/extension/underline/toolbar';
import { toggleBlock } from 'notebookEditor/extension/util/node';
import { dedentBlocksToolItem, indentBlocksToolItem } from 'notebookEditor/shared/toolItem';
import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { CodeBlockTypeToolItem } from './CodeBlockTypeToolItem';

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

    if(isNodeSelection(editor.state.selection)) return true/*disabled*/;

    return false/*enabled*/;
  },
  onClick: (editor) => toggleBlock(editor, NodeName.CODEBLOCK, { [AttributeType.Id]: generateNodeId() }),
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

  component: (props) =>
    <CheckBoxToolItem
      {...props}
      name='Wrap'
      attributeType={AttributeType.Wrap}
      nodeName={NodeName.CODEBLOCK}
    />,

  shouldShow: (editor) => isCodeBlockNode(getParentNode(editor.state.selection)),
};

// == Toolbar =====================================================================
export const CodeBlockToolbar: Toolbar = {
  title: 'Code Block',
  name: NodeName.CODEBLOCK,

  toolsCollections: [
    [
      codeBlockTypeToolItem,
      codeBlockWrapToolItem,
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
      spacingToolItem,
    ],
  ],
};

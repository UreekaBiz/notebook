import { VscReferences } from 'react-icons/vsc';

import { getParentNode, getSelectedNode, isCodeBlockReferenceNode, isListItemContentNode, NodeName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { CodeBlockReferenceChipSelector } from 'notebookEditor/extension/codeblock/toolbar/CodeBlockReferenceChipSelector';
import { shouldShowToolItemInsideList } from 'notebookEditor/extension/list/util';
import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { insertAndSelectCodeBlockReferenceCommand } from '../command';
import { CodeBlockReferenceDelimiterToolItem } from './CodeBlockReferenceDelimiterToolItem/CodeBlockReferenceDelimiterToolItem';

//*********************************************************************************
// == Tool Items ==================================================================
export const codeBlockReferenceToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.CODEBLOCK_REFERENCE,
  label: NodeName.CODEBLOCK_REFERENCE,

  icon: <VscReferences size={16} />,
  tooltip: 'Code Block Reference (⌘ + ⇧ + ⌥ + C)',

  // disable tool item if current selected node is a CodeBlockReference node
  shouldBeDisabled: (editor) => {
    const node = getSelectedNode(editor.state);
    if(node && isCodeBlockReferenceNode(node)) return true/*(SEE: comment above)*/;

    return false;
  },
  shouldShow: (editor, depth) => {
    if(isListItemContentNode(getParentNode(editor.state.selection))) {
      return shouldShowToolItemInsideList(editor.state, depth);
    } /* else -- not inside ListItemContent */

    return depth === undefined || editor.state.selection.$anchor.depth === depth;/*direct parent*/
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, insertAndSelectCodeBlockReferenceCommand),
};

const codeBlockReferenceDelimiterToolItem: ToolItem = {
  toolType: 'component',
  name: 'codeBlockReferenceDelimiterToolItem',

  component: CodeBlockReferenceDelimiterToolItem,
};

const codeBlockReferenceChipSelector: ToolItem = {
  toolType: 'component',
  name: 'CodeBlockReferenceChipSelector',

  component: (props) =>
    <CodeBlockReferenceChipSelector
      {...props}
      nodeName={NodeName.CODEBLOCK_REFERENCE}
    />,
};

// == Toolbar =====================================================================
export const CodeBlockReferenceToolbar: Toolbar = {
  title: 'Code Block Reference',
  name: NodeName.CODEBLOCK_REFERENCE,

  toolsCollections: [
    [
      codeBlockReferenceDelimiterToolItem,
      codeBlockReferenceChipSelector,
    ],
  ],
};

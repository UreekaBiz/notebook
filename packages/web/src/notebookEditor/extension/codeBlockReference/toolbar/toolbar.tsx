import { VscReferences } from 'react-icons/vsc';

import { getSelectedNode, isCodeBlockReferenceNode, NodeName } from '@ureeka-notebook/web-service';

import { CodeBlockReferenceChipSelector } from 'notebookEditor/extension/codeblock/toolbar/CodeBlockReferenceChipSelector';
import { toolItemCommandWrapper } from 'notebookEditor/extension/util/command';
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

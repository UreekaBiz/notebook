import { VscReferences } from 'react-icons/vsc';

import { selectionIsOfType, NodeName } from '@ureeka-notebook/web-service';

import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { CodeBlockReferenceChipSelector } from './CodeBlockReferenceChipSelector';
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
    const { selection } = editor.state;
    if(selectionIsOfType(selection, NodeName.CODEBLOCK_REFERENCE)) return true;

    return false;
  },
  onClick: (editor) => editor.chain().focus().insertCodeBlockReference().run(),
};

const codeBlockReferenceDelimiterToolItem: ToolItem = {
  toolType: 'component',
  name: 'codeBlockReferenceDelimiterToolItem',

  component: CodeBlockReferenceDelimiterToolItem,
};

const codeBlockReferenceChipSelector: ToolItem = {
  toolType: 'component',
  name: 'CodeBlockReferenceChipSelector',

  component: CodeBlockReferenceChipSelector,
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

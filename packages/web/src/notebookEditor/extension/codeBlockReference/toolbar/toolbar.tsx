import { VscReferences } from 'react-icons/vsc';

import { isNodeSelection, NodeName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { CodeBlockReferenceChipSelector } from 'notebookEditor/extension/codeblock/toolbar/CodeBlockReferenceChipSelector';
import { shouldShowToolItem } from 'notebookEditor/shared/toolItem';
import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';

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

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
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

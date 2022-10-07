import { MdOutlineViewDay } from 'react-icons/md';

import { isNodeSelection, NodeName } from '@ureeka-notebook/web-service';

import { ToolItem, Toolbar } from 'notebookEditor/sidebar/toolbar/type';

import { insertAndSelectNestedViewBlockNode } from './util';

//*********************************************************************************
// == Tool Items ==================================================================
export const nestedViewBlockNodeToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.NESTED_VIEW_BLOCK_NODE,
  label: NodeName.NESTED_VIEW_BLOCK_NODE,

  icon: <MdOutlineViewDay size={16} />,
  tooltip: 'Nested View Block Node (⌘ + ⌥ + B)',

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,

  onClick: (editor, depth) => insertAndSelectNestedViewBlockNode(editor, depth, 'toolItem'),
  isActive: (editor) => editor.isActive(NodeName.NESTED_VIEW_BLOCK_NODE),
};

// == Toolbar =====================================================================
export const NestedViewBlockNodeToolbar: Toolbar = {
  title: 'Nested View Block Node',
  name: NodeName.NESTED_VIEW_BLOCK_NODE/*Expected and guaranteed to be unique*/,

  toolsCollections: [[/*currently nothing*/]],
};

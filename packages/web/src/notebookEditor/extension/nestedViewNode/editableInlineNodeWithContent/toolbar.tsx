import { MdCheckBoxOutlineBlank } from 'react-icons/md';

import {  isNodeSelection, NodeName } from '@ureeka-notebook/web-service';

import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { insertAndSelectEditableInlineNodeWithContent } from './util';

//*********************************************************************************
// == Tool Items ==================================================================
export const editableInlineNodeWithContentToolItem: ToolItem = {
  toolType: 'button',
  name: NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT,
  label: NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT,

  icon: <MdCheckBoxOutlineBlank size={16} />,
  tooltip: 'Editable Inline Node with Content (⌘ + E)',

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,

  onClick: (editor, depth) => insertAndSelectEditableInlineNodeWithContent(editor, depth, 'toolItem'),
  isActive: (editor) => editor.isActive(NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT),
};

// == Toolbar =====================================================================
export const EditableInlineNodeWithContentToolbar: Toolbar = {
  title: 'Editable Inline Node With Content',
  name: NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT/*Expected and guaranteed to be unique*/,

  toolsCollections: [[/*currently nothing*/]],
};

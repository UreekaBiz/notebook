import { Editor } from '@tiptap/core';

import { getNestedViewBlockNodeType, generateNodeId, AttributeType, NodeName, SelectionDepth } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper, toolItemCommandWrapper } from 'notebookEditor/command/util';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { insertNestedViewNodeCommand } from '../command';
import { NestedViewBlockNodeStorageType } from './nodeView/controller';

// ********************************************************************************
// inserts a NestedViewBlockNode and sets the TextSelection inside of it.
// This is separated into an utility function since it has to reuse the logic
// for both Keyboard Shortcuts and ToolItems, while being consistent
// with their behavior
export const insertAndSelectNestedViewBlockNode = (editor: Editor, depth: SelectionDepth, from: 'keyboardShortcut' | 'toolItem') => {
  let result = false/*default*/;
  const id = generateNodeId();

  if(from === 'keyboardShortcut') {
    result = shortcutCommandWrapper(editor, insertNestedViewNodeCommand(getNestedViewBlockNodeType(editor.schema), { [AttributeType.Id]: id }));
  } else {
    result = toolItemCommandWrapper(editor, depth, insertNestedViewNodeCommand(getNestedViewBlockNodeType(editor.schema), { [AttributeType.Id]: id }));
  }

  // using a timeout so that the View gets focused until its already been created
  setTimeout(() => {
    const storage = getNodeViewStorage<NestedViewBlockNodeStorageType>(editor, NodeName.NESTED_VIEW_BLOCK_NODE);
    storage.getNodeView(id)?.nodeView.ensureFocus();
  }/*after rendering*/);

  return result/*result of the operation*/;
};

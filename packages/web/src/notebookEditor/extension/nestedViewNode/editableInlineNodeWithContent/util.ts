import { Editor } from '@tiptap/core';

import { generateNodeId, AttributeType, NodeName, SelectionDepth } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper, toolItemCommandWrapper } from 'notebookEditor/command/util';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { insertNestedViewNodeCommand } from '../command';
import { EditableInlineNodeWithContentStorageType } from './nodeView/controller';

// ********************************************************************************
// inserts an EIwC and sets the TextSelection inside of it. This is separated
// into an utility function since it has to reuse the logic for both
// Keyboard Shortcuts and ToolItems, while being consistent with their behavior
export const insertAndSelectEditableInlineNodeWithContent = (editor: Editor, depth: SelectionDepth, from: 'keyboardShortcut' | 'toolItem') => {
  let result = false/*default*/;
  const id = generateNodeId();

  if(from === 'keyboardShortcut') {
    result = shortcutCommandWrapper(editor, insertNestedViewNodeCommand(NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT, { [AttributeType.Id]: id }));
  } else {
    result = toolItemCommandWrapper(editor, depth, insertNestedViewNodeCommand(NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT, { [AttributeType.Id]: id }));
  }

  // using a timeout so that the View gets focused until its already been created
  setTimeout(() => {
    const storage = getNodeViewStorage<EditableInlineNodeWithContentStorageType>(editor, NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT);
    storage.getNodeView(id)?.nodeView.ensureFocus();
  }, 50/*T&E, after rendering*/);

  return result/*result of the operation*/;
};

import { Editor } from '@tiptap/core';
import { NodeType } from 'prosemirror-model';

import { Attributes, AttributeType, NodeName, SelectionDepth } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper, toolItemCommandWrapper } from 'notebookEditor/command/util';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { insertNestedViewNodeCommand } from './command';
import { AbstractNestedNodeViewNodeStorageType } from './nodeView/controller';

// ********************************************************************************
// inserts a NestedViewNode.
// This is separated into an utility function since it has to reuse the logic
// for both Keyboard Shortcuts and ToolItems, while being consistent
// with their behavior
export const insertAndSelectNestedViewNode = (editor: Editor, depth: SelectionDepth, type: NodeType, attrs: Partial<Attributes>, from: 'keyboardShortcut' | 'toolItem') => {
  let result = false/*default*/;

  const id = attrs[AttributeType.Id];
  if(!id) return false/*cannot focus NestedViewNode after insertion*/;

  if(from === 'keyboardShortcut') { result = shortcutCommandWrapper(editor, insertNestedViewNodeCommand(type, attrs)); }
  else { result = toolItemCommandWrapper(editor, depth, insertNestedViewNodeCommand(type, attrs)); }

  // using a timeout so that the View gets focused until its already been created
  setTimeout(() => {
    const storage = getNodeViewStorage<AbstractNestedNodeViewNodeStorageType>(editor, type.name as NodeName/*by definition*/);
    storage.getNodeView(id)?.nodeView.ensureFocus();
  }/*after rendering*/);

  return result/*result of the operation*/;
};

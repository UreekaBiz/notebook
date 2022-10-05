import { Node } from '@tiptap/core';

import { getNodeOutputSpec, isEditableInlineNodeWithContentNode, AttributeType, EditableInlineNodeWithContentNodeSpec, NodeName, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { NoOptions } from 'notebookEditor/model/type';

import { uniqueIdParsingBehavior } from '../../util/attribute';
import { EditableInlineNodeWithContentController, EditableInlineNodeWithContentStorageType } from './nodeView/controller';
import { insertAndSelectEditableInlineNodeWithContent } from './util';

// ********************************************************************************
// == Node ========================================================================
export const EditableInlineNodeWithContent = Node.create<NoOptions, EditableInlineNodeWithContentStorageType>({
  ...EditableInlineNodeWithContentNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // Creates a new id for the node when it is created.
      [AttributeType.Id]: uniqueIdParsingBehavior(this.storage),
    };
  },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Mod-e': () => insertAndSelectEditableInlineNodeWithContent(this.editor, this.editor.state.selection.$anchor.depth, 'keyboardShortcut'),
      'Mod-E': () => insertAndSelectEditableInlineNodeWithContent(this.editor, this.editor.state.selection.$anchor.depth, 'keyboardShortcut'),
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new NodeViewStorage<EditableInlineNodeWithContentController>(); },

  // -- View ----------------------------------------------------------------------
  // NOTE: NodeViews are supposed to be unique for each Node (based on the id of
  //       the node). This is done to persist the state of the node.
  addNodeView() {
    return ({ editor, node, getPos }) => {
      if(!isEditableInlineNodeWithContentNode(node)) throw new Error(`Unexpected node type (${node.type.name}) while adding EditableInlineNodeWithContent NodeView.`);

      const id = node.attrs[AttributeType.Id];
      if(!id) return {}/*invalid id -- no node view returned*/;

      const controller = this.storage.getNodeView(id);

      // Use existing NodeView, update it and return it
      if(controller) {
        controller.updateProps(getPos);
        return controller;
      } /* else -- controller don't exists */

      // create a new controller and NodeView instead
      return new EditableInlineNodeWithContentController(editor, node, this.storage, getPos);
    };
  },

  parseHTML() { return [{ tag: `span[${DATA_NODE_TYPE}="${NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT}"]` }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});

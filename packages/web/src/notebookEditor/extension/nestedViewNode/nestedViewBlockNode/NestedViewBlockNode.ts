import { Node } from '@tiptap/core';

import { getNodeOutputSpec, isNestedViewBlockNode, AttributeType, NestedViewBlockNodeSpec, NodeName, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { NoOptions } from 'notebookEditor/model/type';

import { uniqueIdParsingBehavior } from '../../util/attribute';
import { NestedViewBlockNodeController, NestedViewBlockNodeStorageType } from './nodeView/controller';
import { insertAndSelectNestedViewBlockNode } from './util';

// ********************************************************************************
// == Node ========================================================================
export const NestedViewBlockNode = Node.create<NoOptions, NestedViewBlockNodeStorageType>({
  ...NestedViewBlockNodeSpec,

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
      'Mod-shift-b': () => insertAndSelectNestedViewBlockNode(this.editor, this.editor.state.selection.$anchor.depth, 'keyboardShortcut'),
      'Mod-shift-B': () => insertAndSelectNestedViewBlockNode(this.editor, this.editor.state.selection.$anchor.depth, 'keyboardShortcut'),
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new NodeViewStorage<NestedViewBlockNodeController>(); },

  // -- View ----------------------------------------------------------------------
  // NOTE: NodeViews are supposed to be unique for each Node (based on the id of
  //       the node). This is done to persist the state of the node.
  addNodeView() {
    return ({ editor, node, getPos }) => {
      if(!isNestedViewBlockNode(node)) throw new Error(`Unexpected node type (${node.type.name}) while adding NestedViewBlockNode NodeView.`);

      const id = node.attrs[AttributeType.Id];
      if(!id) return {}/*invalid id -- no node view returned*/;

      const controller = this.storage.getNodeView(id);

      // Use existing NodeView, update it and return it
      if(controller) {
        controller.updateProps(getPos);
        return controller;
      } /* else -- controller don't exists */

      // create a new controller and NodeView instead
      return new NestedViewBlockNodeController(editor, node, this.storage, getPos);
    };
  },

  parseHTML() { return [{ tag: `div[${DATA_NODE_TYPE}="${NodeName.NESTED_VIEW_BLOCK_NODE}"]` }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});


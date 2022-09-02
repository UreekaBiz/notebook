import { Node } from '@tiptap/core';

import { getNodeOutputSpec, isCodeBlockReferenceNode, AttributeType, CodeBlockReferenceNodeSpec, NodeName, SetAttributeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { setAttributeParsingBehavior, uniqueIdParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { NoOptions } from 'notebookEditor/model/type';

import { insertAndSelectCodeBlockReferenceCommand } from './command';
import { CodeBlockReferenceController, CodeBlockReferenceStorageType } from './nodeView/controller';

// ********************************************************************************
// == Node ========================================================================
export const CodeBlockReference = Node.create<NoOptions, CodeBlockReferenceStorageType>({
  ...CodeBlockReferenceNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // Creates a new id for the node when it is created.
    [AttributeType.Id]: uniqueIdParsingBehavior(this.storage),

      [AttributeType.LeftDelimiter]: setAttributeParsingBehavior(AttributeType.LeftDelimiter, SetAttributeType.STRING),
      [AttributeType.CodeBlockReference]: setAttributeParsingBehavior(AttributeType.CodeBlockReference, SetAttributeType.STRING),
      [AttributeType.RightDelimiter]: setAttributeParsingBehavior(AttributeType.RightDelimiter, SetAttributeType.STRING),
    };
  },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      // insert a CodeBlockReference
      'Shift-Alt-Mod-c': () => shortcutCommandWrapper(this.editor, insertAndSelectCodeBlockReferenceCommand),
      'Shift-Alt-Mod-C': () => shortcutCommandWrapper(this.editor, insertAndSelectCodeBlockReferenceCommand),
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new NodeViewStorage<CodeBlockReferenceController>(); },

  // -- View ----------------------------------------------------------------------
  // NOTE: NodeViews are supposed to be unique for each Node (based on the id of
  //       the node). This is done to persist the state of the node.
  addNodeView() {
    return ({ editor, node, getPos }) => {
      if(!isCodeBlockReferenceNode(node)) throw new Error(`Unexpected node type (${node.type.name}) while adding CodeBlockReference NodeView.`);
      const id = node.attrs[AttributeType.Id];
      if(!id) return {}/*invalid id -- no node view returned*/;

      const controller = this.storage.getNodeView(id);

      // Use existing NodeView, update it and return it.
      if(controller) {
        controller.updateProps(getPos);
        return controller;
      } /* else -- controller don't exists */

      // Create a new controller and NodeView instead.
      return new CodeBlockReferenceController(editor, node, this.storage, getPos);
    };
  },
  parseHTML() { return [{ tag: `span[${DATA_NODE_TYPE}="${NodeName.CODEBLOCK_REFERENCE}"]` }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, true/*is leaf node*/); },
});


import { Node } from '@tiptap/core';

import { generateNodeId, getNodeOutputSpec, isCodeBlockReferenceNode, AttributeType, CodeBlockReferenceNodeSpec, NodeName, SetAttributeType } from '@ureeka-notebook/web-service';

import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { NoOptions } from 'notebookEditor/model/type';

import { setAttributeParsingBehavior } from '../util/attribute';
import { insertAndSelectCodeBlockReference } from './command';
import { CodeBlockReferenceController, CodeBlockReferenceStorageType } from './nodeView/controller';
import { codeBlockReferenceOnTransaction } from './transaction';

// ********************************************************************************
// == Node ========================================================================
export const CodeBlockReference = Node.create<NoOptions, CodeBlockReferenceStorageType>({
  ...CodeBlockReferenceNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // Creates a new id for the node when it is created.
      [AttributeType.Id]: { parseHTML: () => generateNodeId() },

      [AttributeType.LeftDelimiter]: setAttributeParsingBehavior(AttributeType.LeftDelimiter, SetAttributeType.STRING),
      [AttributeType.CodeBlockReference]: setAttributeParsingBehavior(AttributeType.CodeBlockReference, SetAttributeType.STRING),
      [AttributeType.RightDelimiter]: setAttributeParsingBehavior(AttributeType.RightDelimiter, SetAttributeType.STRING),
    };
  },

  // -- Command -------------------------------------------------------------------
  addCommands() { return { insertCodeBlockReference: insertAndSelectCodeBlockReference }; },
  addKeyboardShortcuts() {
    return {
      // insert a CodeBlockReference
      'Shift-Alt-Mod-c': () => this.editor.commands.insertCodeBlockReference(),
      'Shift-Alt-Mod-C': () => this.editor.commands.insertCodeBlockReference(),
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new NodeViewStorage<CodeBlockReferenceController>(); },

  // -- Transaction ---------------------------------------------------------------
  // check to see if a Transaction affects a CodeBlock. If it does, update
  // CodeBlockReferences NodeViews so that they match the state
  onTransaction({ transaction }) { return codeBlockReferenceOnTransaction(transaction, this.storage); },

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
      } // else -- controller don't exists

      // Create a new controller and NodeView instead.
      return new CodeBlockReferenceController(editor, node, this.storage, getPos);
    };
  },
  parseHTML() { return [{ tag: NodeName.CODEBLOCK_REFERENCE }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, true/*is leaf node*/); },
});


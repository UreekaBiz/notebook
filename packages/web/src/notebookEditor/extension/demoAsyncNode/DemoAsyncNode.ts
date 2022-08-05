import { Node } from '@tiptap/core';

import { getNodeOutputSpec, isDemoAsyncNode, AttributeType, DemoAsyncNodeSpec, NodeName, SetAttributeType, DEFAULT_DEMO_ASYNC_NODE_ID, DEFAULT_DEMO_ASYNC_NODE_DELAY, DEFAULT_DEMO_ASYNC_NODE_STATUS, DEFAULT_DEMO_ASYNC_NODE_TEXT } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { NoOptions } from 'notebookEditor/model/type';

import { insertAndSelectDemoAsyncNode } from './command';
import { DemoAsyncNodeController, DemoAsyncNodeStorageType } from './nodeView/controller';

// ********************************************************************************
// == Node ========================================================================
export const DemoAsyncNode = Node.create<NoOptions, DemoAsyncNodeStorageType>({
  ...DemoAsyncNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.Id]: setAttributeParsingBehavior(AttributeType.Id, SetAttributeType.STRING, DEFAULT_DEMO_ASYNC_NODE_ID),

      [AttributeType.CodeBlockReferences]: setAttributeParsingBehavior(AttributeType.CodeBlockReferences, SetAttributeType.ARRAY, [/*default empty*/]),
      [AttributeType.CodeBlockHashes]: setAttributeParsingBehavior(AttributeType.CodeBlockHashes, SetAttributeType.ARRAY, [/*default empty*/]),

      [AttributeType.Status]: setAttributeParsingBehavior(AttributeType.Status, SetAttributeType.STRING, DEFAULT_DEMO_ASYNC_NODE_STATUS),
      [AttributeType.Text]: setAttributeParsingBehavior(AttributeType.Text, SetAttributeType.STRING, DEFAULT_DEMO_ASYNC_NODE_TEXT),

      [AttributeType.Delay]: setAttributeParsingBehavior(AttributeType.Delay, SetAttributeType.NUMBER, DEFAULT_DEMO_ASYNC_NODE_DELAY),
    };
  },

  // -- Command -------------------------------------------------------------------
  addCommands() { return { insertDemoAsyncNode: insertAndSelectDemoAsyncNode }; },
  addKeyboardShortcuts() {
    return {
      // create a demo async node
      'Shift-Mod-d': () => this.editor.commands.insertDemoAsyncNode(),
      'Shift-Mod-D': () => this.editor.commands.insertDemoAsyncNode(),
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new NodeViewStorage<DemoAsyncNodeController>(); },

  // -- View ----------------------------------------------------------------------
  addNodeView() {
    return ({ editor, node, getPos }) => {
      if(!isDemoAsyncNode(node)) throw new Error(`Unexpected node type (${node.type.name}) while adding DemoAsyncNode NodeView.`);
      return new DemoAsyncNodeController(editor, node, this.storage, getPos);
    };
  },
  parseHTML() { return [{ tag: NodeName.DEMO_ASYNC_NODE }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, true/*is leaf node*/); },
});


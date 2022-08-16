import { Node } from '@tiptap/core';

import { generateNodeId, getNodeOutputSpec, isDemoAsyncNode, AttributeType, DemoAsyncNodeSpec, NodeName, SetAttributeType, DEFAULT_DEMO_ASYNC_NODE_DELAY, DEFAULT_DEMO_ASYNC_NODE_STATUS, DEFAULT_DEMO_ASYNC_NODE_TEXT } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior, uniqueIdParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { NoOptions } from 'notebookEditor/model/type';
import { focusChipToolInput } from 'notebookEditor/util';

import { insertAndSelectDemoAsyncNode } from './command';
import { DemoAsyncNodeController, DemoAsyncNodeStorageType } from './nodeView/controller';

// ********************************************************************************
// == Node ========================================================================
export const DemoAsyncNode = Node.create<NoOptions, DemoAsyncNodeStorageType>({
  ...DemoAsyncNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // Creates a new id for the node when it is created.
      [AttributeType.Id]: uniqueIdParsingBehavior(this.storage),

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
      'Shift-Mod-d': () => {
        const id = generateNodeId();
        this.editor.commands.insertDemoAsyncNode({ id });
        focusChipToolInput(id);
        return true/*command executed*/;
      },
      'Shift-Mod-D': () => {
        const id = generateNodeId();
        this.editor.commands.insertDemoAsyncNode({ id });
        focusChipToolInput(id);
        return true/*command executed*/;
      },
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new NodeViewStorage<DemoAsyncNodeController>(); },

  // -- View ----------------------------------------------------------------------
  // NOTE: NodeViews are supposed to be unique for each Node (based on the id of
  //       the node). This is done to persist the state of the node.
  addNodeView() {
    return ({ editor, node, getPos }) => {
      if(!isDemoAsyncNode(node)) throw new Error(`Unexpected node type (${node.type.name}) while adding DemoAsyncNode NodeView.`);
      const id = node.attrs[AttributeType.Id];
      if(!id) return {}/*invalid id -- no node view returned*/;

      const controller = this.storage.getNodeView(id);

      // Use existing NodeView, update it and return it.
      if(controller) {
        controller.updateProps(getPos);
        return controller;
      } // else -- controller don't exists

      // Create a new controller and NodeView instead.
      return new DemoAsyncNodeController(editor, node, this.storage, getPos);
    };
  },
  parseHTML() { return [{ tag: NodeName.DEMO_ASYNC_NODE }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, true/*is leaf node*/); },
});


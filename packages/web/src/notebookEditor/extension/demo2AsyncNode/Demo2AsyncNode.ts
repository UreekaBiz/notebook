import { Node } from '@tiptap/core';

import { createBlockNodeCommand, generateNodeId, getNodeOutputSpec, isDemo2AsyncNode, AttributeType, Demo2AsyncNodeSpec, NodeName, SetAttributeType, DATA_NODE_TYPE, DEFAULT_DEMO_2_ASYNC_NODE_DELAY, DEFAULT_DEMO_2_ASYNC_NODE_STATUS } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { setAttributeParsingBehavior, uniqueIdParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { NoOptions } from 'notebookEditor/model/type';

import { handleBlockBackspace, handleBlockArrowUp, handleBlockArrowDown } from '../util/node';
import { Demo2AsyncNodeController, Demo2AsyncNodeStorageType } from './nodeView/controller';

// ********************************************************************************
// == Node ========================================================================
export const Demo2AsyncNode = Node.create<NoOptions, Demo2AsyncNodeStorageType>({
  ...Demo2AsyncNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // Creates a new id for the node when it is created.
      [AttributeType.Id]: uniqueIdParsingBehavior(this.storage),

      [AttributeType.Delay]: setAttributeParsingBehavior(AttributeType.Delay, SetAttributeType.NUMBER, DEFAULT_DEMO_2_ASYNC_NODE_DELAY),
      [AttributeType.Status]: setAttributeParsingBehavior(AttributeType.Status, SetAttributeType.STRING, DEFAULT_DEMO_2_ASYNC_NODE_STATUS),

      [AttributeType.TextToReplace]: setAttributeParsingBehavior(AttributeType.TextToReplace, SetAttributeType.STRING),

      [AttributeType.FontSize]: setAttributeParsingBehavior(AttributeType.FontSize, SetAttributeType.STRING),
      [AttributeType.TextColor]: setAttributeParsingBehavior(AttributeType.TextColor, SetAttributeType.STRING),

      [AttributeType.PaddingTop]: setAttributeParsingBehavior(AttributeType.PaddingTop, SetAttributeType.STRING),
      [AttributeType.PaddingBottom]: setAttributeParsingBehavior(AttributeType.PaddingBottom, SetAttributeType.STRING),
      [AttributeType.PaddingLeft]: setAttributeParsingBehavior(AttributeType.PaddingLeft, SetAttributeType.STRING),
      [AttributeType.PaddingRight]: setAttributeParsingBehavior(AttributeType.PaddingRight, SetAttributeType.STRING),

      [AttributeType.MarginTop]: setAttributeParsingBehavior(AttributeType.MarginTop, SetAttributeType.STRING),
      [AttributeType.MarginLeft]: setAttributeParsingBehavior(AttributeType.MarginLeft, SetAttributeType.STRING),
      [AttributeType.MarginBottom]: setAttributeParsingBehavior(AttributeType.MarginBottom, SetAttributeType.STRING),
      [AttributeType.MarginRight]: setAttributeParsingBehavior(AttributeType.MarginRight, SetAttributeType.STRING),
    };
  },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      // create a Demo2AsyncNode
      'Shift-Alt-Mod-d': () => shortcutCommandWrapper(this.editor, createBlockNodeCommand(NodeName.DEMO_2_ASYNC_NODE, { [AttributeType.Id]: generateNodeId() })),
      'Shift-Alt-Mod-D': () => shortcutCommandWrapper(this.editor, createBlockNodeCommand(NodeName.DEMO_2_ASYNC_NODE, { [AttributeType.Id]: generateNodeId() })),

      // remove Demo2AsyncNode when at start of document or Demo2AsyncNode is empty
      'Backspace': ({ editor }) => handleBlockBackspace(editor, NodeName.DEMO_2_ASYNC_NODE),

      // set GapCursor if necessary
      'ArrowUp': ({ editor }) => handleBlockArrowUp(editor, NodeName.DEMO_2_ASYNC_NODE),
      'ArrowDown': ({ editor }) => handleBlockArrowDown(editor, NodeName.DEMO_2_ASYNC_NODE),

      // (SEE: NOTE in Demo2AsyncNodeSpec for code property)
      // exit Node on shift enter, inserting a Paragraph below
      'Shift-Enter': ({ editor }) => editor.commands.exitCode(),
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new NodeViewStorage<Demo2AsyncNodeController>(); },

  // -- View ----------------------------------------------------------------------
  // NOTE: NodeViews are supposed to be unique for each Node (based on the id of
  //       the node). This is done to persist the state of the node.
  addNodeView() {
    return ({ editor, node, getPos }) => {
      if(!isDemo2AsyncNode(node)) throw new Error(`Unexpected node type (${node.type.name}) while adding Demo2AsyncNode NodeView.`);
      const id = node.attrs[AttributeType.Id];
      if(!id) return {}/*invalid id -- no node view returned*/;

      const controller = this.storage.getNodeView(id);

      // Use existing NodeView, update it and return it.
      if(controller) {
        controller.updateProps(getPos);
        return controller;
      } // else -- controller don't exists

      // Create a new controller and NodeView instead.
      return new Demo2AsyncNodeController(editor, node, this.storage, getPos);
    };
  },
  parseHTML() { return [{ tag: `div[${DATA_NODE_TYPE}="${NodeName.DEMO_2_ASYNC_NODE}"]`, preserveWhitespace: 'full'/*preserve new lines when parsing the content of the demo2AsyncNode*/ }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, false/*is not a leaf node*/); },
});

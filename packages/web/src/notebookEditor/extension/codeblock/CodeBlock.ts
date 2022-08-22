import { textblockTypeInputRule, Node } from '@tiptap/core';

import { createBlockNodeBelow, generateNodeId, getNodeOutputSpec, isCodeBlockNode, AttributeType, CodeBlockNodeSpec, CodeBlockType, NodeName, SetAttributeType } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior, uniqueIdParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { handleBlockArrowDown, handleBlockArrowUp, handleBlockBackspace } from 'notebookEditor/extension/util/node';
import { NoOptions } from 'notebookEditor/model/type';

import { shortcutCommandWrapper } from '../util/command';
import { CodeBlockController } from './nodeView/controller';
import { CodeBlockStorage } from './nodeView/storage';
import { codeBlockOnTransaction } from './transaction';

// ********************************************************************************
// == Node ========================================================================
export const CodeBlock = Node.create<NoOptions, CodeBlockStorage>({
  ...CodeBlockNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // Creates a new id for the node when it is created.
      [AttributeType.Id]: uniqueIdParsingBehavior(this.storage),

      [AttributeType.Type]: setAttributeParsingBehavior(AttributeType.Type, SetAttributeType.STRING, CodeBlockType.Code),
      [AttributeType.Wrap]: setAttributeParsingBehavior(AttributeType.Wrap, SetAttributeType.BOOLEAN, false/*default wrap for Code type is false*/),

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
      // toggle a code block
      'Shift-Mod-c': () => shortcutCommandWrapper(this.editor, createBlockNodeBelow(NodeName.CODEBLOCK, { [AttributeType.Id]: generateNodeId() })),
      'Shift-Mod-C': () => shortcutCommandWrapper(this.editor, createBlockNodeBelow(NodeName.CODEBLOCK, { [AttributeType.Id]: generateNodeId() })),

      // remove code block when at start of document or code block is empty
      'Backspace': ({ editor }) => handleBlockBackspace(editor, NodeName.CODEBLOCK),

      // set gap cursor if necessary
      'ArrowUp': ({ editor }) => handleBlockArrowUp(editor, NodeName.CODEBLOCK),
      'ArrowDown': ({ editor }) => handleBlockArrowDown(editor, NodeName.CODEBLOCK),

      // exit node on shift enter, inserting a paragraph below
      'Shift-Enter': ({ editor }) => editor.commands.exitCode(),
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new CodeBlockStorage(); },

  // -- Transaction ---------------------------------------------------------------
  // Check to see if a transaction adds or removes a Heading or a CodeBlock, or if
  // it changes the level of a Heading. Recompute the necessary CodeBlock visual IDs
  // if this is the case
  onTransaction({ transaction }) { return codeBlockOnTransaction(transaction, this.editor, this.storage); },

  // -- Input ---------------------------------------------------------------------
  // Create a CodeBlock node if the user types ``` and then an enter or space
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /```([a-z]+)?[\s\n]$/,
        type: this.type,
      }),
    ];
  },

  // -- View ----------------------------------------------------------------------
  // NOTE: NodeViews are supposed to be unique for each Node (based on the id of
  //       the node). This is done to persist the state of the node.
  addNodeView() {
    return ({ editor, node, getPos }) => {
      if(!isCodeBlockNode(node)) throw new Error(`Unexpected node type (${node.type.name}) while adding CodeBlockNode NodeView.`);
      const id = node.attrs[AttributeType.Id];
      if(!id) return {}/*invalid id -- no node view returned*/;

      const controller = this.storage.getNodeView(id);

      // Use existing NodeView, update it and return it.
      if(controller) {
        controller.updateProps(getPos);
        return controller;
      } // else -- controller don't exists

      // Create a new controller and NodeView instead.
      return new CodeBlockController(editor, node, this.storage, getPos);
    };
  },

  parseHTML() { return [{ tag: NodeName.CODEBLOCK, preserveWhitespace: 'full'/*preserve new lines when parsing the content of the codeBloc*/ }]; },

  // NOTE: renderHTML -must- be included in Nodes regardless of whether or not
  //       they use a nodeView. (SEE: FeatureDoc, NodeView section)
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});

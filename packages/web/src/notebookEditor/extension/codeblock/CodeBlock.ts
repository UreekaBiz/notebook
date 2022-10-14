import { textblockTypeInputRule, Node } from '@tiptap/core';

import { generateNodeId, getNodeOutputSpec, isCodeBlockNode, leaveBlockNodeCommand, selectBlockNodeContentCommand, AttributeType, CodeBlockNodeSpec, CodeBlockType, NodeName, SetAttributeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { setAttributeParsingBehavior, uniqueIdParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NoOptions } from 'notebookEditor/model/type';

import { blockArrowUpCommand, blockArrowDownCommand, blockBackspaceCommand, blockModBackspaceCommand, toggleBlock } from '../util/node';
import { CodeBlockController } from './nodeView/controller';
import { CodeBlockStorage } from './nodeView/storage';
import { codeBlockOnTransaction } from './transaction';

// ********************************************************************************
// == Constant ====================================================================
const codeBlockRegEx = /```([a-z]+)?[\s\n]$/;

// == Node ========================================================================
export const CodeBlock = Node.create<NoOptions, CodeBlockStorage>({
  ...CodeBlockNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // creates a new Id for the Node when it is created
      [AttributeType.Id]: uniqueIdParsingBehavior(this.storage),

      [AttributeType.Type]: setAttributeParsingBehavior(AttributeType.Type, SetAttributeType.STRING, CodeBlockType.Code),
      [AttributeType.Wrap]: setAttributeParsingBehavior(AttributeType.Wrap, SetAttributeType.BOOLEAN, false/*default wrap for Code type is false*/),

      [AttributeType.PaddingTop]: setAttributeParsingBehavior(AttributeType.PaddingTop, SetAttributeType.STYLE),
      [AttributeType.PaddingBottom]: setAttributeParsingBehavior(AttributeType.PaddingBottom, SetAttributeType.STYLE),
      [AttributeType.PaddingLeft]: setAttributeParsingBehavior(AttributeType.PaddingLeft, SetAttributeType.STYLE),
      [AttributeType.PaddingRight]: setAttributeParsingBehavior(AttributeType.PaddingRight, SetAttributeType.STYLE),

      [AttributeType.MarginTop]: setAttributeParsingBehavior(AttributeType.MarginTop, SetAttributeType.STYLE),
      [AttributeType.MarginLeft]: setAttributeParsingBehavior(AttributeType.MarginLeft, SetAttributeType.STYLE),
      [AttributeType.MarginBottom]: setAttributeParsingBehavior(AttributeType.MarginBottom, SetAttributeType.STYLE),
      [AttributeType.MarginRight]: setAttributeParsingBehavior(AttributeType.MarginRight, SetAttributeType.STYLE),
    };
  },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      // toggle a CodeBlock
      'Shift-Mod-c': () => toggleBlock(this.editor, NodeName.CODEBLOCK, { [AttributeType.Id]: generateNodeId() }),
      'Shift-Mod-C': () => toggleBlock(this.editor, NodeName.CODEBLOCK, { [AttributeType.Id]: generateNodeId() }),

      // remove CodeBlock when Selection is at start of Document or CodeBlock is empty
      'Backspace': () => shortcutCommandWrapper(this.editor, blockBackspaceCommand(NodeName.CODEBLOCK)),

      // maintain expected Mod-Backspace behavior
      'Mod-Backspace': () => shortcutCommandWrapper(this.editor, blockModBackspaceCommand(NodeName.CODEBLOCK)),

      // set GapCursor if necessary
      'ArrowUp': () => shortcutCommandWrapper(this.editor, blockArrowUpCommand(NodeName.CODEBLOCK)),
      'ArrowDown': () => shortcutCommandWrapper(this.editor, blockArrowDownCommand(NodeName.CODEBLOCK)),

      // exit Node on Shift-Enter
      'Shift-Enter': () => shortcutCommandWrapper(this.editor, leaveBlockNodeCommand(NodeName.CODEBLOCK)),

      // select all the content of the CodeBlock
      'Cmd-a':  () => shortcutCommandWrapper(this.editor, selectBlockNodeContentCommand(NodeName.CODEBLOCK)),
      'Cmd-A':  () => shortcutCommandWrapper(this.editor, selectBlockNodeContentCommand(NodeName.CODEBLOCK)),
    };
  },

  // -- Storage -------------------------------------------------------------------
  addStorage() { return new CodeBlockStorage(); },

  // -- Transaction ---------------------------------------------------------------
  // check to see if a Transaction adds or removes a Heading or a CodeBlock, or if
  // it changes the level of a Heading. Recompute the necessary CodeBlock visual IDs
  // if this is the case
  onTransaction({ transaction }) { return codeBlockOnTransaction(transaction, this.editor, this.storage); },

  // -- Input ---------------------------------------------------------------------
  // create a CodeBlock Node if the user types ``` and then an enter or space
  addInputRules() { return [textblockTypeInputRule({ find: codeBlockRegEx, type: this.type })]; },

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
      } /* else -- controller don't exists */

      // create a new Controller and NodeView instead
      return new CodeBlockController(editor, node, this.storage, getPos);
    };
  },

  parseHTML() { return [{ tag: `div[${DATA_NODE_TYPE}="${NodeName.CODEBLOCK}"]`, preserveWhitespace: 'full'/*preserve new lines when parsing the content of the codeBlock*/ }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});

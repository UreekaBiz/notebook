import { wrappingInputRule, Node } from '@tiptap/core';

import { getNodeOutputSpec, leaveBlockNodeCommand, selectBlockNodeContentCommand, AttributeType, BlockquoteNodeSpec, NodeName, SetAttributeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { setAttributeParsingBehavior } from '../util/attribute';
import { blockArrowUpCommand, blockArrowDownCommand, blockBackspaceCommand, blockModBackspaceCommand, toggleBlock } from '../util/node';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-blockquote/src/blockquote.ts

// == RegEx =======================================================================
export const blockquoteRegex = /^\s*>\s$/;

// == Node ========================================================================
export const Blockquote = Node.create<NoOptions, NoStorage>({
  ...BlockquoteNodeSpec,
  priority: ExtensionPriority.BLOCKQUOTE,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.BorderLeft]: setAttributeParsingBehavior(AttributeType.BorderLeft, SetAttributeType.STYLE),
      [AttributeType.BorderColor]: setAttributeParsingBehavior(AttributeType.BorderColor, SetAttributeType.STYLE),
      [AttributeType.MarginLeft]: setAttributeParsingBehavior(AttributeType.MarginLeft, SetAttributeType.STYLE),
    };
  },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      // Toggle Blockquote
      'Mod-Shift-b': () => toggleBlock(this.editor, NodeName.BLOCKQUOTE, {/*no attrs*/}),
      'Mod-Shift-B': () => toggleBlock(this.editor, NodeName.BLOCKQUOTE, {/*no attrs*/}),

      // remove Blockquote when at start of document or Blockquote is empty
      'Backspace': () => shortcutCommandWrapper(this.editor, blockBackspaceCommand(NodeName.BLOCKQUOTE)),

      // maintain expected Mod-Backspace behavior
      'Mod-Backspace': () => shortcutCommandWrapper(this.editor, blockModBackspaceCommand(NodeName.BLOCKQUOTE)),

      // set GapCursor if necessary
      'ArrowUp': () => shortcutCommandWrapper(this.editor, blockArrowUpCommand(NodeName.BLOCKQUOTE)),
      'ArrowDown': () => shortcutCommandWrapper(this.editor, blockArrowDownCommand(NodeName.BLOCKQUOTE)),

      // exit Node on Shift-Enter
      'Shift-Enter': () => shortcutCommandWrapper(this.editor, leaveBlockNodeCommand(NodeName.BLOCKQUOTE)),

      // select all the content of the Blockquote
      'Cmd-a':  () => shortcutCommandWrapper(this.editor, selectBlockNodeContentCommand(NodeName.BLOCKQUOTE)),
      'Cmd-A':  () => shortcutCommandWrapper(this.editor, selectBlockNodeContentCommand(NodeName.BLOCKQUOTE)),
    };
  },

  // -- Input ---------------------------------------------------------------------
  // ensure that lines that begin with '>' get turned into Blockquotes
  addInputRules() { return [wrappingInputRule({ find: blockquoteRegex, type: this.type })]; },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return [{ tag: `blockquote[${DATA_NODE_TYPE}="${NodeName.BLOCKQUOTE}"]` }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});

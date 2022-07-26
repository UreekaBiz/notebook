import { wrappingInputRule, Node } from '@tiptap/core';

import { getNodeOutputSpec, insertNewlineCommand, leaveBlockNodeCommand, selectBlockNodeContentCommand, AttributeType, BlockquoteNodeSpec, NodeName, SetAttributeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { setAttributeParsingBehavior } from '../util/attribute';
import { blockArrowUpCommand, blockArrowDownCommand, blockBackspaceCommand, blockModBackspaceCommand, toggleBlock } from '../util/node';

// ********************************************************************************
// == RegEx =======================================================================
// NOTE: this is inspired by https://github.com/ueberdosis/tiptap/blob/8c6751f0c638effb22110b62b40a1632ea6867c9/packages/extension-blockquote/src/blockquote.ts
export const blockquoteRegex = /^\s*>\s$/;

// == Node ========================================================================
export const Blockquote = Node.create<NoOptions, NoStorage>({
  ...BlockquoteNodeSpec,
  priority: ExtensionPriority.BLOCKQUOTE,

  // REF: https://github.com/ueberdosis/tiptap/blob/8c6751f0c638effb22110b62b40a1632ea6867c9/packages/core/src/helpers/getSchemaByResolvedExtensions.ts
  // NOTE: since TipTap is not adding the whitespace prop to the default
  //       NodeSpec created by the editor (SEE: REF above), this call
  //       has to be performed instead, so that all the attributes specified
  //       in the BlockquoteNodeSpec get added correctly
  extendNodeSchema: (extension) => ({ ...BlockquoteNodeSpec }),

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.BackgroundColor]: setAttributeParsingBehavior(AttributeType.BackgroundColor, SetAttributeType.STYLE),
      [AttributeType.BorderLeft]: setAttributeParsingBehavior(AttributeType.BorderLeft, SetAttributeType.STYLE),
      [AttributeType.BorderColor]: setAttributeParsingBehavior(AttributeType.BorderColor, SetAttributeType.STYLE),
      [AttributeType.Color]: setAttributeParsingBehavior(AttributeType.Color, SetAttributeType.STYLE),
      [AttributeType.FontSize]: setAttributeParsingBehavior(AttributeType.FontSize, SetAttributeType.STYLE),
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

      // insert a newline on Enter
      'Enter': () => shortcutCommandWrapper(this.editor, insertNewlineCommand(NodeName.BLOCKQUOTE)),

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

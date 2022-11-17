import { Node } from '@tiptap/core';

import { getNodeOutputSpec, AttributeType, BulletListNodeSpec, NodeName, SetAttributeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { getWrappingListInputRule, handleListDocumentUpdates } from '../util';

// ********************************************************************************
// == RegEx =======================================================================
// (SEE: addInputRules below)
// NOTE: this is inspired by https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bullet-list/src/bullet-list.ts
const bulletListRegEx = /^\s*([-+*])\s$/;

// == Node ========================================================================
export const BulletList = Node.create<NoOptions, NoStorage>({
  ...BulletListNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() { return { [AttributeType.MarginLeft]: setAttributeParsingBehavior(AttributeType.MarginLeft, SetAttributeType.STYLE) }; },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-8': () => handleListDocumentUpdates(this.editor, NodeName.BULLET_LIST),
      'Ctrl-Shift-8': () => handleListDocumentUpdates(this.editor, NodeName.BULLET_LIST),
    };
  },

  // -- Input ---------------------------------------------------------------------
  // create a bulletList node when typing '*', '-' or '+' at the start of a newline
  addInputRules() { return [ getWrappingListInputRule({ find: bulletListRegEx, type: this.type }) ]; /*(SEE: getListInputRule)*/ },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return [ { tag: `ul, ul[${DATA_NODE_TYPE}="${NodeName.BULLET_LIST}"]` } ]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, false/*not a leaf node*/); },
});

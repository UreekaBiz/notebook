import { Node } from '@tiptap/core';

import { getNodeOutputSpec, BulletListNodeSpec, NodeName, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { getWrappingListInputRule, handleListDocumentUpdates } from '../util';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bullet-list/src/bullet-list.ts

// == RegEx =======================================================================
// (SEE: addInputRules below)
const bulletListRegEx = /^\s*([-+*])\s$/;

// == Node ========================================================================
export const BulletList = Node.create<NoOptions, NoStorage>({
  ...BulletListNodeSpec,

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
  parseHTML() { return [ { tag: `ul[${DATA_NODE_TYPE}="${NodeName.BULLET_LIST}"]` } ]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, false/*not a leaf node*/); },
});

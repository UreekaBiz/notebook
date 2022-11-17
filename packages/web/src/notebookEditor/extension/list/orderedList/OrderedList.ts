import { Node } from '@tiptap/core';

import { getNodeOutputSpec, AttributeType, NodeName, OrderedListNodeSpec, SetAttributeType, DATA_NODE_TYPE, ORDERED_LIST_DEFAULT_START } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { getWrappingListInputRule, handleListDocumentUpdates } from '../util';

// ********************************************************************************

// == RegEx =======================================================================
// NOTE: this is inspired by https://github.com/ueberdosis/tiptap/blob/main/packages/extension-ordered-list/src/ordered-list.ts
// (SEE: addInputRules below)
const orderedListRegex = /^(\d+)\.\s$/;

// == Node ========================================================================
export const OrderedList = Node.create<NoOptions, NoStorage>({
  ...OrderedListNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      [AttributeType.StartValue]: setAttributeParsingBehavior(AttributeType.StartValue, SetAttributeType.NUMBER, ORDERED_LIST_DEFAULT_START),

      [AttributeType.MarginLeft]: setAttributeParsingBehavior(AttributeType.MarginLeft, SetAttributeType.STYLE),
    };
  },

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-7': () => handleListDocumentUpdates(this.editor, NodeName.ORDERED_LIST),
      'Ctrl-Shift-7': () => handleListDocumentUpdates(this.editor, NodeName.ORDERED_LIST),
    };
  },

  // -- Input ---------------------------------------------------------------------
  // create an OrderedList node if the user types a number followed by a dot, and
  // then an enter or a space
  addInputRules() {
    return [
      // (SEE: getListInputRule)
      getWrappingListInputRule({
        find: orderedListRegex,
        type: this.type,
        getAttributes: (match) => ({ [AttributeType.StartValue]: +match[1] }),
        joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1],
      }),
    ];
  },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return [{ tag: `ol, ol[${DATA_NODE_TYPE}="${NodeName.ORDERED_LIST}"]` }]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes, false/*not a leaf node*/); },
});

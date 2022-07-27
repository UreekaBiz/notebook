import { Mark } from '@tiptap/core';

import { BoldMarkSpec } from 'common';

import { getMarkOutputSpec } from 'notebookEditor/extension/util/attribute';
import { markInputRule, markPasteRule } from 'notebookEditor/extension/util/mark';
import { safeParseTag, wrapGetStyleAttrs, wrapGetTagAttrs } from 'notebookEditor/extension/util/parse';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { setBoldCommand, toggleBoldCommand, unsetBoldCommand } from './command';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bold/src/bold.ts

// == RegEx =======================================================================
const cssFontWeightRegex = /^(bold(er)?|[5-9]\d{2}|1000)$/;

// --------------------------------------------------------------------------------
// NOTE: these are Markdown equivalents
const starRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/;
const underscoreRegex = /(?:^|\s)((?:__)((?:[^_]+))(?:__))/ /*FIXME: incorrect / inconsistent RegEx (negated '__')*/;

// == Mark ========================================================================
export const Bold = Mark.create<NoOptions, NoStorage>({
  ...BoldMarkSpec,

  // -- Command -------------------------------------------------------------------
  addCommands() {
    return {
      setBold: setBoldCommand,
      unsetBold: unsetBoldCommand,
      toggleBold: toggleBoldCommand,
    };
  },
  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-B': () => this.editor.commands.toggleBold(),
    };
  },

  // -- Input ---------------------------------------------------------------------
  // apply the bold Mark to typed or pasted text that is surrounded by '**' or '__'
  addInputRules() { return [ markInputRule(starRegex, this.type), markInputRule(underscoreRegex, this.type) ]; },
  addPasteRules() { return [ markPasteRule(starRegex, this.type), markPasteRule(underscoreRegex, this.type) ]; },

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return [
      safeParseTag('strong'),
      { ...safeParseTag('b'), getAttrs: wrapGetTagAttrs(node => node.style.fontWeight !== 'normal') },
      { style: 'font-weight', getAttrs: wrapGetStyleAttrs(value => cssFontWeightRegex.test(value)) },
    ];
  },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});

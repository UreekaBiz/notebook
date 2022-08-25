import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, StrikethroughMarkSpec } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { markInputRule, markPasteRule } from 'notebookEditor/extension/util/mark';
import { safeParseTag } from 'notebookEditor/extension/util/parse';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { toggleStrikethroughCommand } from './command';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bold/src/bold.ts

// == RegEx =======================================================================
const strikethroughInputRegEx = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/;
const strikethroughPasteRegEx = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/g;

// == Mark ========================================================================
export const Strikethrough = Mark.create<NoOptions, NoStorage>({
  ...StrikethroughMarkSpec,

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() { return { 'Mod-Shift-x': () => shortcutCommandWrapper(this.editor, toggleStrikethroughCommand) }; },

  // -- Input ---------------------------------------------------------------------
  // apply the strikethrough mark to any text that is typed or pasted in between
  // '~~' symbols, or when pasting text wrapped in them
  addInputRules() { return [ markInputRule(strikethroughInputRegEx, this.type ) ]; },
  addPasteRules() { return [ markPasteRule(strikethroughPasteRegEx, this.type ) ]; },

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return [
      safeParseTag('s'),
      safeParseTag('del'),
      safeParseTag('strike'),
      {
        style: 'text-decoration',
        consuming: false/*allow other rules to keep matching after this one matches*/,
        getAttrs: (style) => (typeof style === 'string' && style.includes('line-through') ? {/*match, with no attributes*/} : false/*don't match rule*/),
      },
    ];
  },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});

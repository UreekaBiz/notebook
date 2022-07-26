import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, AttributeType, CodeMarkSpec, SetAttributeType } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { markInputRule, markPasteRule } from 'notebookEditor/extension/util/mark';
import { safeParseTag } from 'notebookEditor/extension/util/parse';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { setAttributeParsingBehavior } from '../util/attribute';
import { toggleCodeCommand } from './command';

// ********************************************************************************
// == RegEx =======================================================================
// NOTE: these are inspired by https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code/src/code.ts
export const backtickInputRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))$/;
export const backtickPasteRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))/g;

// == Mark ========================================================================
export const Code = Mark.create<NoOptions, NoStorage>({
  ...CodeMarkSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() { return { [AttributeType.BackgroundColor]: setAttributeParsingBehavior(AttributeType.Href, SetAttributeType.STRING) };},

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Mod-e': () => shortcutCommandWrapper(this.editor, toggleCodeCommand),
      'Mod-E': () => shortcutCommandWrapper(this.editor, toggleCodeCommand),
    };
  },

  // -- Input ---------------------------------------------------------------------
  // apply the Code Mark to typed or pasted text that is surrounded by '`'
  addInputRules() { return [ markInputRule(backtickInputRegex, this.type) ]; },
  addPasteRules() { return [ markPasteRule(backtickPasteRegex, this.type) ]; },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return [safeParseTag('code')]; },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});

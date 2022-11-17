import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, ItalicMarkSpec } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { markInputRule, markPasteRule } from 'notebookEditor/extension/util/mark';
import { safeParseTag, wrapGetTagAttrs } from 'notebookEditor/extension/util/parse';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { toggleItalicCommand } from './command';

// ********************************************************************************
// == RegEx =======================================================================
// NOTE: these are inspired by https://github.com/ueberdosis/tiptap/blob/main/packages/extension-italic/src/italic.ts
const starInputRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/;
const starPasteRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/g;
const underscoreInputRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/;
const underscorePasteRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))/g;

// == Mark ========================================================================
export const Italic = Mark.create<NoOptions, NoStorage>({
  ...ItalicMarkSpec,

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Mod-i': () => shortcutCommandWrapper(this.editor, toggleItalicCommand),
      'Mod-I': () => shortcutCommandWrapper(this.editor, toggleItalicCommand),
    };
  },

  // -- Input ---------------------------------------------------------------------
  // apply the Italic Mark to typed or pasted text that is surrounded by '*' or '_'
  addInputRules() { return [markInputRule(starInputRegex, this.type), markInputRule(underscoreInputRegex, this.type)]; },
  addPasteRules() { return [markPasteRule(starPasteRegex, this.type), markPasteRule(underscorePasteRegex, this.type)]; },

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return [
      safeParseTag('em'),
      {
        tag: 'i',
        getAttrs: wrapGetTagAttrs((node) => {
          const style = node.getAttribute('style');
          if(!style) return false/*don't match rule*/;

          if(style.includes('italic')) {
            return {/*match, with no attributes*/};
          } else {
            return false/*don't match rule*/;
          }
        }),
      },
      { style: 'font-style=italic' },
    ];
  },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});

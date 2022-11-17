import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, UnderlineMarkSpec } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { safeParseTag, wrapGetStyleAttrs } from 'notebookEditor/extension/util/parse';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { toggleUnderlineCommand } from './command';

// ********************************************************************************
// == Mark ========================================================================
export const Underline = Mark.create<NoOptions, NoStorage>({
  ...UnderlineMarkSpec,

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      'Mod-u': () => shortcutCommandWrapper(this.editor, toggleUnderlineCommand),
      'Mod-U': () => shortcutCommandWrapper(this.editor, toggleUnderlineCommand),
    };
  },

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return [
      safeParseTag('u'),
      {
        style: 'text-decoration',
        consuming: false/*keep matching rules after this one*/,
        getAttrs: wrapGetStyleAttrs(style => style.includes('underline') ? {/*match, with no attributes*/} : false/*do not match*/),
      },
    ];
  },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});

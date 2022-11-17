import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, SuperScriptMarkSpec } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { safeParseTag, wrapGetStyleAttrs } from '../util/parse';
import { toggleSuperScriptCommand } from './command';

// ********************************************************************************
// NOTE: this is inspired by https://github.com/ueberdosis/tiptap/blob/main/packages/extension-superscript/src/superscript.ts

// == Mark ========================================================================
export const SuperScript = Mark.create<NoOptions, NoStorage>({
  ...SuperScriptMarkSpec,

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() { return { 'Mod-.': () => shortcutCommandWrapper(this.editor, toggleSuperScriptCommand) }; },

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return [
      safeParseTag('sup'),
      {
        style: 'vertical-align',
        getAttrs: wrapGetStyleAttrs(value => {
          // check for vertical alignment
          if(value !== 'super') {
            return false;
          } /* else -- match */

          return null/*match and add empty/default set of attrs */;
        }),
      },
    ];
  },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});

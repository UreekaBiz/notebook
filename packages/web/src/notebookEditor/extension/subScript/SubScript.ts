import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, SubScriptMarkSpec } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { safeParseTag, wrapGetStyleAttrs } from '../util/parse';
import { toggleSubScriptCommand } from './command';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-subscript/src/subscript.ts

// == Mark ========================================================================
export const SubScript = Mark.create<NoOptions, NoStorage>({
  ...SubScriptMarkSpec,

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() { return { 'Mod-,': () => shortcutCommandWrapper(this.editor, toggleSubScriptCommand) }; },

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return [
      safeParseTag('sub'),
      {
        style: 'vertical-align',
        getAttrs: wrapGetStyleAttrs(value => {
          // check for vertical alignment
          if(value !== 'sub') {
            return false;
          } /* else -- match */

          return null/*match and add empty/default set of attrs */;
        }),
      },
    ];
  },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});

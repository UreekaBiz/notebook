import { Extension } from '@tiptap/react';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';

import { ExtensionName } from 'notebookEditor/model/type';

// ********************************************************************************
// REF: https://github.com/ProseMirror/prosemirror-history/blob/master/src/history.ts

// == Extension ===================================================================
export const History = Extension.create({
  name: ExtensionName.HISTORY/*Expected and guaranteed to be unique*/,

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() {
    return [
      history({ depth: 100/*PM's default*/, newGroupDelay: 500/*PM's default, in ms*/ }),
      keymap({ 'Mod-z': undo, 'Mod-Shift-z': redo }),
    ];
  },
});

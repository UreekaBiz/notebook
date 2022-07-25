import { Extension } from '@tiptap/react';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';

// ********************************************************************************
// REF: https://github.com/ProseMirror/prosemirror-history/blob/master/src/history.ts

// == Extension ===================================================================
export const HISTORY_META = 'addToHistory';
export const History = Extension.create({
  addProseMirrorPlugins() {
    return [ history({ depth: 100/*PM's default*/, newGroupDelay: 1/*in ms*/ }), keymap({ 'Mod-z': undo, 'Mod-Shift-z': redo }) ];
  },
});

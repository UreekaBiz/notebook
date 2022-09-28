import { Extension } from '@tiptap/core';
import { dropCursor } from 'prosemirror-dropcursor';

import { ExtensionName } from 'notebookEditor/model/type';

// ********************************************************************************
// == Extension ===================================================================
export interface DropCursorOptions { color: string; width: number; class: string; }
export const DropCursor = Extension.create<DropCursorOptions>({
  name: ExtensionName.DROP_CURSOR/*Expected and guaranteed to be unique*/,

  // -- Attribute -----------------------------------------------------------------
  addOptions() { return { color: 'black', width: 1, class: ''/*none*/ }; },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [ dropCursor(this.options) ]; },
});

import { Extension } from '@tiptap/core';
import { dropCursor } from 'prosemirror-dropcursor';

import { ExtensionName } from 'notebookEditor/model/type';

// ********************************************************************************
// == Extension ===================================================================
export interface DropCursorOptions { color: string | null; width: number | null; class: string | null; }
export const DropCursor = Extension.create<DropCursorOptions>({
  name: ExtensionName.DROP_CURSOR/*Expected and guaranteed to be unique*/,

  // -- Attribute -----------------------------------------------------------------
  addOptions() { return { color: 'currentColor', width: 1, class: null }; },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [ dropCursor(this.options) ]; },
});

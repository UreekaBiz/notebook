import { Extension, callOrReturn, getExtensionField } from '@tiptap/core';
import { gapCursor } from 'prosemirror-gapcursor';

import { ExtensionName, NoOptions, NoStorage } from 'notebookEditor/model/type';

// ********************************************************************************
// REF: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-gapcursor/src/gapcursor.ts

// == Extension ===================================================================
export const GapCursor: Extension<NoOptions, NoStorage> = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.GAP_CURSOR/*Expected and guaranteed to be unique*/,

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [gapCursor()]; },

  // -- Schema --------------------------------------------------------------------
  extendNodeSchema(extension) {
    const context = {
      name: this.name,
      options: this.options,
      storage: this.storage,
    };

    return { [ExtensionName.GAP_CURSOR_ALLOW]: callOrReturn(getExtensionField<typeof GapCursor>(extension, ExtensionName.GAP_CURSOR_ALLOW, context)) ?? null };
  },
});

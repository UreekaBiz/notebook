import { Extension } from '@tiptap/core';

import { ExtensionName, ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { KeymapPlugin } from './plugin';

// ********************************************************************************
// == Extension ===================================================================
export const Keymap = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.KEYMAP/*Expected and guaranteed to be unique*/,
  priority: ExtensionPriority.KEYMAP,

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() { return {
    // REF: https://prosemirror.net/docs/ref/#commands.pcBaseKeymap
    // NOTE: the default behavior for Mod-Enter (SEE: REF above) is to call
    //       exitCode() (which inserts a Paragraph below when the Selection is in a
    //       Node with the code prop in its Spec set to true. Since this behavior has
    //       been customized to Shift-Enter, reserving Cmd-Enter for execution of
    //       other Nodes at a Document level, return true
    //       (preventing the default behavior)
    'Mod-Enter': () => true/*do not let PM handle the shortcut*/,
  }; },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [KeymapPlugin(this.editor)]; },
});

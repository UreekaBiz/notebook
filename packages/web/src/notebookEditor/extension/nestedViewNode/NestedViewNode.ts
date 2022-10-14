import { Extension } from '@tiptap/core';

import { ExtensionName, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { nestedViewNodeBackspaceCommand } from './command';
import { nestedViewNodePlugin } from './plugin';

// ********************************************************************************
// NOTE: nestedViewNodes are meant to be an abstraction for Inline or Block Nodes
//       whose functionality involves a nested EditorView.
// NOTE: All common attributes shared across NestedViewNodes are defined in its
//       corresponding common file
//       (SEE: src/common/notebookEditor/extension/nestedViewNode.ts)
// == Extension ===================================================================
export const NestedViewNode = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.NESTED_VIEW_NODE,

  // -- Keyboard Shortcut ---------------------------------------------------------
  // NOTE: not using shortcutCommandWrapper since this is meant to prevent the
  //       deletion of a NestedViewNode, and it also focuses its inner View
  addKeyboardShortcuts() { return { 'Backspace': () => nestedViewNodeBackspaceCommand(this.editor.state, this.editor.view.dispatch) }; },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() {return [nestedViewNodePlugin()];},
});

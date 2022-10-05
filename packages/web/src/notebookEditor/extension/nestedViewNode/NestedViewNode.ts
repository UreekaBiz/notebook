import { Extension } from '@tiptap/core';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
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
  addKeyboardShortcuts() { return { 'Backspace': () => shortcutCommandWrapper(this.editor, nestedViewNodeBackspaceCommand) }; },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() {return [nestedViewNodePlugin()];},
});

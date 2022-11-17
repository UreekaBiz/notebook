import { Node } from '@tiptap/core';

import { TextNodeSpec } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { insertTabCommand } from './command';

// ********************************************************************************
// NOTE: this is inspired by https://raw.githubusercontent.com/ueberdosis/tiptap/main/packages/extension-text/src/text.ts

// == Node ========================================================================
export const Text = Node.create<NoOptions, NoStorage>({
  ...TextNodeSpec,
  priority: ExtensionPriority.TEXT/*(SEE: ExtensionPriority)*/,

  // -- Keyboard Shortcut ---------------------------------------------------------
  addKeyboardShortcuts() { return { 'Tab': () => shortcutCommandWrapper(this.editor, insertTabCommand) }; },
});

import { Extension } from '@tiptap/core';

import { ExtensionName, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { setStyleCommand } from './command';

// ********************************************************************************
// == Extension ===================================================================
export const Style = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.STYLE,

  // -- Command ------------------------------------------------------------------=
  addCommands() { return { setStyle: setStyleCommand }; },
});

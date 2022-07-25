import { Node } from '@tiptap/core';

import { TextNodeSpec } from '@ureeka-notebook/web-service';

import { NoOptions, NoStorage } from 'notebookEditor/model/type';

// ********************************************************************************
// REF: https://raw.githubusercontent.com/ueberdosis/tiptap/main/packages/extension-text/src/text.ts

// == Node ==============================================================================
export const Text = Node.create<NoOptions, NoStorage>({
  ...TextNodeSpec,
});

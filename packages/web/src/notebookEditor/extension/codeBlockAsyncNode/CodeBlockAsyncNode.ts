import { Extension } from '@tiptap/core';

import { ExtensionName, ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

// ********************************************************************************
// NOTE: CodeBlockAsyncNodes are meant to be an abstraction for all async nodes
//       whose behavior relates to codeBlocks. As such, any functionality that
//       is common to all of them is implemented here.
// NOTE: All common attributes shared across codeBlockAsyncNodes are defined in its
//       corresponding common file
//       (SEE: src/common/notebookEditor/extension/codeBlockAsyncNode.ts)

// == Extension ===================================================================
export const CodeBlockAsyncNode = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.CODEBLOCK_ASYNC_NODE,
  priority: ExtensionPriority.CODEBLOCK_ASYNC_NODE,

  // currently no common functionality to all codeBlockAsyncNodes
});

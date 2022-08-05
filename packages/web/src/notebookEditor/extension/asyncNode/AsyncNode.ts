import { Extension } from '@tiptap/core';

import { ExtensionName, ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { checkDirty } from './checkDirty';

// ********************************************************************************
// NOTE: AsyncNodes are meant to be an abstraction for all async nodes. As such,
//       any functionality that is common to all of them is implemented here.
// NOTE: All common attributes shared across asyncNodes are defined in its
//       corresponding common file
//       (SEE: src/common/notebookEditor/extension/asyncNode.ts)
// == Extension ===================================================================
export const AsyncNode = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.ASYNC_NODE,
  priority: ExtensionPriority.ASYNC_NODE,

  // -- Transaction ---------------------------------------------------------------
  // check if any async nodes are considered to be dirty after this transaction
  onTransaction({ transaction }) { checkDirty(transaction, this.editor); },
});

import { Editor } from '@tiptap/core';
import { Node } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';

import { NodeName } from '@ureeka-notebook/service-common';

// ********************************************************************************
// handle the subscriptions to changes for nodes in the editor.
// SEE: NodeObserver.ts
export type TransactionEvent = {
  editor: Editor;
  transaction: Transaction;
}

// ================================================================================
export type NodeChange<T extends Node = Node> = {
  node: T;
  position: number;
  removed: boolean;
};
export type NodeChanges = Map<NodeName, NodeChange[]>;

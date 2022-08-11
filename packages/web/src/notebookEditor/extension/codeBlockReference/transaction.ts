import { Transaction } from 'prosemirror-state';

import { wereNodesAffectedByTransaction, NodeName } from '@ureeka-notebook/web-service';

import { CodeBlockReferenceStorageType } from './nodeView/controller';

// ********************************************************************************
// NOTE: this is explicitly separate from codeBlockOnTransaction
//       to separate concerns

// == Constant ====================================================================
const codeBlockSet = new Set([NodeName.CODEBLOCK]);

// == Transaction =================================================================
// check to see if a Transaction affects a CodeBlock. If it does, update
// CodeBlockReferences NodeViews so that they match the state
export const codeBlockReferenceOnTransaction = (transaction: Transaction, storage: CodeBlockReferenceStorageType) => {
  if(transaction.doc === transaction.before) return/*no changes*/;

  if(!wereNodesAffectedByTransaction(transaction, codeBlockSet)) return/*nothing changed*/;

  // update all of the CodeBlockReferences based on the new structure
  storage.forEachNodeView(codeBlockReferenceView => codeBlockReferenceView.nodeView.updateView());
};

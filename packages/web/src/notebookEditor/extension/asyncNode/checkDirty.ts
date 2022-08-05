import { Editor } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';

import { asyncNodes, wereNodesAffectedByTransaction, AsyncNodeStatus, NodeName } from '@ureeka-notebook/web-service';

import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { AbstractAsyncNodeStorageType } from './nodeView/controller';

// ********************************************************************************
// == Constant ====================================================================
const codeBlockAsyncNodeNames = new Set<NodeName>([...asyncNodes, NodeName.CODEBLOCK]);

// == Transaction =================================================================
// Ensures that AsyncNodes have a dirty state if any of the conditions mentioned
// below is true for them:
// For Nodes in the inclusion set):
// 1. if the amount of CodeBlockReferences has changed, set to dirty
// 2. if the order of the CodeBlockReferences has changed, set to dirty
// 3. if the content of any of the CodeBlocks that are referenced has changed, set to dirty

// NOTE: these get computed based on the hashes of the references and
//       the codeBlockReferences that they represent, since the hashes are
//       what does not change until a new async call is performed
export const checkDirty = (transaction: Transaction, editor: Editor) => {
  if(transaction.doc === transaction.before) return/*no changes*/;

  if(!wereNodesAffectedByTransaction(transaction, codeBlockAsyncNodeNames)) return/*not affected*/;

  checkIfAsyncNodesDirty(editor);
};

// ================================================================================
// ................................................................................
// checks to see whether or not the AsyncNodes of a particular AbstractAsyncNodeStorageType
// fulfils the requirements to be considered dirty, and tells their view to set
// them to dirty if they do
const checkIfAsyncNodesDirty = (editor: Editor) => {
  const asyncNodeTypesArray = Array.from(asyncNodes.values());

  for(let i=0; i<asyncNodeTypesArray.length; i++) {
    // check if each async node in the corresponding storage is dirty
    const asyncNodeStorage = getNodeViewStorage<AbstractAsyncNodeStorageType>(editor, asyncNodeTypesArray[i]);
    asyncNodeStorage.forEachNodeView(asyncNodeView => {
      if(asyncNodeView.node.attrs.status === AsyncNodeStatus.NEVER_EXECUTED) return/*cannot be dirty by definition*/;

      if(!asyncNodeView.nodeModel.isAsyncNodeDirty()) {
        asyncNodeView.setDirty(false)/*not dirty*/;
        return/*nothing left to do*/;
      }/* else -- its dirty */

      asyncNodeView.setDirty(true);
    });
  }
};

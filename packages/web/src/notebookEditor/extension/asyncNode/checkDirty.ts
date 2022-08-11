import { Editor } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';

import { asyncNodes, wereNodesAffectedByTransaction, AsyncNodeStatus, AttributeType, NodeName } from '@ureeka-notebook/web-service';

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

  // checks to see whether or not the AsyncNodes of a particular AbstractAsyncNodeStorageType
  // fulfils the requirements to be considered dirty, and tells their view to set
  // them to dirty if they do
  const asyncNodeTypesArray = Array.from(asyncNodes.values());

  for(let i=0; i<asyncNodeTypesArray.length; i++) {
    const nodeName = asyncNodeTypesArray[i];

    // check if each async node in the corresponding storage is dirty
    const storage = getNodeViewStorage<AbstractAsyncNodeStorageType>(editor, nodeName);
    storage.forEachNodeView(controller => {
      const status = controller.node.attrs[AttributeType.Status];
      if(!status || status === AsyncNodeStatus.NEVER_EXECUTED) return/*cannot be dirty by definition*/;

      if(typeof controller.nodeModel.isAsyncNodeDirty !== 'function') return/*cannot compute*/;

      // update model and view
      const isDirty = controller.nodeModel.isAsyncNodeDirty();
      controller.setDirty(isDirty);
    });
  }
};

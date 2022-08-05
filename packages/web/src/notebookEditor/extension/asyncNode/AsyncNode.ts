import { Editor, Extension } from '@tiptap/core';
import { Plugin, Transaction } from 'prosemirror-state';

import { getNodesAffectedByStepMap, isAsyncNode, nonEditableWhileOperatingAsyncNodes, NotebookSchemaType, NodeName, NodeFound } from '@ureeka-notebook/web-service';

import { ExtensionName, ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';
import { AbstractAsyncNodeStorageType } from './nodeView/controller';
import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

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

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() {
    return [
      new Plugin<NotebookSchemaType>({
        // -- Transaction ---------------------------------------------------------
        // Ensure that a transaction that modifies an async node that is currently
        // performing an async operation does not get applied
        filterTransaction: (transaction, editorState) => {
          if(!asyncNodesOperatingAffected(this.editor, transaction)) {
            return true/*no nodes operating asynchronously affected, apply transaction*/;
          } else {
            return false/*do not apply transaction*/;
          }
        },
      }),
    ];
  },

  // -- Transaction ---------------------------------------------------------------
  // check if any async nodes are considered to be dirty after this transaction
  onTransaction({ transaction }) { checkDirty(transaction, this.editor); },
});

// == Util ========================================================================
// NOTE: not using 'wereNodesAffectedByTransaction' since the required check is
//       for async nodes that are operating asynchronously during the transaction
const asyncNodesOperatingAffected = (editor: Editor, transaction: Transaction<NotebookSchemaType>): boolean => {
  let asyncNodesOperatingAffected = false/*default*/;

  const { maps } = transaction.mapping;
  for(let stepMapIndex=0; stepMapIndex<maps.length; stepMapIndex++) {
    // NOTE: unfortunately StepMap does not expose an array interface so that a
    //       for-loop-break construct could be used here for performance reasons
    maps[stepMapIndex].forEach((unmappedOldStart, unmappedOldEnd) => {
      const { oldNodeObjs, newNodeObjs } = getNodesAffectedByStepMap(transaction, stepMapIndex, unmappedOldStart, unmappedOldEnd, nonEditableWhileOperatingAsyncNodes);
      if(checkForOperatingAsyncNodeObjs(editor, oldNodeObjs) || checkForOperatingAsyncNodeObjs(editor, newNodeObjs)) {
        asyncNodesOperatingAffected = true;
      }/* else -- do not change default value*/
    });
    if(asyncNodesOperatingAffected) return true;
  }

  return asyncNodesOperatingAffected;
};

const checkForOperatingAsyncNodeObjs = (editor: Editor, nodeObjs: NodeFound[]): boolean => {
  for(let i = 0; i < nodeObjs.length; i++) {
    if(!isAsyncNode(nodeObjs[i].node)) continue;

    const storage = getNodeViewStorage<AbstractAsyncNodeStorageType>(editor, nodeObjs[i].node.type.name as NodeName/*by definition*/);
    if(!storage) throw new Error(`Storage for async node ${nodeObjs[i].node.type.name} does not exist when it should`);

    const asyncNodeView = storage.getNodeView(nodeObjs[i].node.attrs.id);
    if(!(asyncNodeView?.nodeModel.getPerformingAsyncOperation())) continue;

    return true/*an async node that was operating asynchronously was affected during transaction*/;
  }

  return false/*no async nodes that were operating asynchronously were affected during transaction*/;
};

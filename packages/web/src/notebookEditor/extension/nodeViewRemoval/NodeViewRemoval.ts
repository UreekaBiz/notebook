import { Extension } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';

import { NotebookSchemaType, NodeName } from '@ureeka-notebook/web-service';

import { ExtensionName, ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

import { computeRemovedNodeObjs, getNodesAffectedByStepMap, NodeFound } from '../util/node';

// ********************************************************************************
// == Extension ===================================================================
export const NodeViewRemoval = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.NODEVIEW_REMOVAL,
  priority: ExtensionPriority.NODEVIEW_REMOVAL,

  // -- Transaction ---------------------------------------------------------------
  onTransaction({ transaction }) {
    const removedNodeObjs = getAddedAndRemovedNodes(transaction);
    removedNodeObjs.forEach(removedObj => this.editor.storage[removedObj.node.type.name].removeNode(removedObj.node.attrs.id));
  },
});

// == Util ========================================================================
const nodesWithNodeView = new Set<NodeName>()/*FIXME: what fills this?!?!*/;
const getAddedAndRemovedNodes = (transaction: Transaction<NotebookSchemaType>) => {
  let removedNodeObjs: NodeFound[] = [];

  transaction.mapping.maps.forEach((stepMap, stepMapIndex) => {
    stepMap.forEach((unmappedOldStart, unmappedOldEnd) => {
      const { oldNodeObjs, newNodeObjs } = getNodesAffectedByStepMap(transaction, stepMapIndex, unmappedOldStart, unmappedOldEnd, nodesWithNodeView);

      if(oldNodeObjs.length > newNodeObjs.length)
        removedNodeObjs = computeRemovedNodeObjs(oldNodeObjs, newNodeObjs);
      /* else -- no nodes were removed */
    });
  });
  return removedNodeObjs;
};

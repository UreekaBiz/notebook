import { Extension } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';

import { computeRemovedNodePositions, getNodesAffectedByStepMap, AttributeType, NotebookSchemaType, NodePosition, NodeName } from '@ureeka-notebook/web-service';

import { ExtensionName, ExtensionPriority, NoOptions, NoStorage } from 'notebookEditor/model/type';

// ********************************************************************************
// the set of Node 'types' whose nodeViews are to be checked for and removed
// when they no longer exist (the inclusion set). Like other extensions, the names
// of nodes that require this functionality must be added here
const nodesWithNodeView = new Set<NodeName>([NodeName.CODEBLOCK, NodeName.CODEBLOCK_REFERENCE, NodeName.DEMO_ASYNC_NODE, NodeName.DEMO_2_ASYNC_NODE]);

// == Extension ===================================================================
export const NodeViewRemoval = Extension.create<NoOptions, NoStorage>({
  name: ExtensionName.NODEVIEW_REMOVAL/*Expected and guaranteed to be unique*/,
  priority: ExtensionPriority.NODEVIEW_REMOVAL,

  // -- Transaction ---------------------------------------------------------------
  onTransaction({ transaction }) {
    const removedNodePositions = getRemovedNodes(transaction);
    removedNodePositions.forEach(removedObj => this.editor.storage[removedObj.node.type.name].removeNodeView(removedObj.node.attrs[AttributeType.Id]));
  },
});

// == Util ========================================================================
const getRemovedNodes = (transaction: Transaction<NotebookSchemaType>) => {
  const { maps } = transaction.mapping;
  let removedNodePositions: NodePosition[] = [/*empty by default*/];
  // NOTE: not using 'wereNodesAffectedByTransaction' since the required check is
  //       for nodes that were removed by the transaction
  // NOTE: Since certain operations (e.g. dragging and dropping a node) occur
  //       throughout more than one stepMapIndex, returning as soon as possible
  //       from this method can lead to incorrect behavior (e.g. the dragged node's
  //       nodeView being deleted before the next stepMap adds it back). For this
  //       reason the removed nodes are computed on each stepMap and the final
  //       removedNodeObjs array is what is returned.
  // NOTE: This is true for this extension specifically given its intent
  //       (removing views from their storage maps if their nodes got deleted),
  //       and does not mean that other extensions or plugins that use similar
  //       functionality to see if nodes got deleted or added cannot return early,
  //       as this will depend on their specific intent
  for(let stepMapIndex=0; stepMapIndex < maps.length; stepMapIndex++) {
    maps[stepMapIndex].forEach((unmappedOldStart, unmappedOldEnd) => {
      const { oldNodePositions, newNodePositions } = getNodesAffectedByStepMap(transaction, stepMapIndex, unmappedOldStart, unmappedOldEnd, nodesWithNodeView);
      removedNodePositions = computeRemovedNodePositions(oldNodePositions, newNodePositions);
    });
  }
  return removedNodePositions;
};

import { Plugin } from 'prosemirror-state';

import { getNodesAffectedByStepMap, getParagraphNodeType, isDocumentNode, NodeName } from '@ureeka-notebook/web-service';

import { ALLOW_LIST_ITEM_CONTENT_META } from './update';

// ********************************************************************************
// == Constant ====================================================================
const listItemContentNodeSet = new Set([NodeName.LIST_ITEM_CONTENT]);

// == Plugin ======================================================================
// this Plugin prevents ListItemContent Nodes from ever being direct children of
// the Document node. This can happen when Lists are toggled back to Paragraphs
// or when they are deleted (e.g. through backspace)
export const listItemContentPlugin = () => new Plugin({
  // -- Transaction ---------------------------------------------------------------
  appendTransaction(transactions, oldState, newState) {
    if(oldState.doc === newState.doc) return/*no changes*/;
    const { tr } = newState;

    if(transactions.some(tr => tr.getMeta(ALLOW_LIST_ITEM_CONTENT_META/*(SEE: ./update.ts)*/))) {
      return tr/*do not modify */;
    } /* else -- do not allow ListItemContent as direct child of Doc */

    // NOTE: this Transaction has to step through all stepMaps without leaving
    //       early since, its main concern to check whether a ListItemContent Node
    //       has the Document as its parent, where the replacement of Nodes that
    //       can lead to the situation happens across several stepMapIndexes
    //       (SEE: NodeViewRemoval.ts for more details)
    for(let i=0;i<transactions.length;i++) {
      const { maps } = transactions[i].mapping;

      // iterate over all maps in the Transaction
      for(let stepMapIndex=0; stepMapIndex<maps.length; stepMapIndex++) {
        // (SEE: NOTE above)
        maps[stepMapIndex].forEach((unmappedOldStart, unmappedOldEnd) => {
          const { newNodePositions } = getNodesAffectedByStepMap(transactions[i], stepMapIndex, unmappedOldStart, unmappedOldEnd, listItemContentNodeSet);
          for(let j=0; j<newNodePositions.length; j++) {
            const resolvedNodePos = tr.doc.resolve(newNodePositions[j].position);
            if(isDocumentNode(resolvedNodePos.parent)) {
              // NOTE: if this is true, then by contract (the Document being the
              //       direct parent) resolvedNodePos will point at the start of
              //       the Node. Hence, the range can be compute by adding its size
              tr.setBlockType(resolvedNodePos.pos, resolvedNodePos.pos + newNodePositions[j].node.nodeSize, getParagraphNodeType(newState.schema));
            }
          }
        });
      }
    }

    return tr/*updated*/;
  },
});


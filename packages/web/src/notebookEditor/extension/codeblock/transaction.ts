import { Editor } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';

import { getNodesAffectedByStepMap, isHeadingNode, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { getNodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { CodeBlockStorage } from './nodeView/storage';

// ********************************************************************************
// Check to see if a transaction adds or removes a Heading or a CodeBlock, or if
// it changes the level of a Heading. Recompute the necessary CodeBlock visual IDs
// if this is the case

// NOTE: it is the responsibility of this onTransaction to update all NodeViews
//       that depend on CodeBlocks or Headings (e.g. CodeBlockReferences besides
//       CodeBlocks themselves) to avoid duplication of onTransactions, and have
//       a SSoT for the conditions that trigger these changes

// == Constant ====================================================================
const codeBlockHeadingNodeNames = new Set([NodeName.CODEBLOCK, NodeName.HEADING]);

// == Transaction =================================================================
export const codeBlockOnTransaction = (transaction: Transaction, editor: Editor, codeBlockStorage: CodeBlockStorage) => {
  if(transaction.doc === transaction.before) return/*no changes*/;

  if(!codeBlocksOrHeadingsChanged(transaction)) return/*nothing changed*/;

  // update all of the visual IDs based on the new structure
  codeBlockStorage.updateVisualIds(editor);
  codeBlockStorage.forEachNodeView(codeBlockView => codeBlockView.nodeView.updateView());

  // update all of the CodeBlockReferences based on the new structure
  const codeBlockReferenceStorage = getNodeViewStorage(editor, NodeName.CODEBLOCK_REFERENCE);
  codeBlockReferenceStorage.forEachNodeView(codeBlockReferenceView => codeBlockReferenceView.nodeView.updateView());
};

// ................................................................................
// NOTE: not using 'wereNodesAffectedByTransaction' since the required checks
//       are specific to the relation between CodeBlocks and Headings
// NOTE: this is written for performance since this is called effectively on every keypress
const codeBlocksOrHeadingsChanged = (transaction: Transaction) => {
  // walk all of the changes in the transaction looking for the first place where
  // an edit occurred that would require the visual IDs to be recomputed.
  // check to see if the lengths differ. If they do, a Heading or a CodeBlock
  // was added or removed. In either case the visualIDs must be recomputed
  const { maps } = transaction.mapping;
  for(let stepMapIndex=0; stepMapIndex<maps.length; stepMapIndex++) {
    // NOTE: unfortunately StepMap does not expose an array interface so that a
    //       for-loop-break construct could be used here for performance reasons
    let shouldUpdate = false/*default*/;
    maps[stepMapIndex].forEach((unmappedOldStart, unmappedOldEnd) => {
      if(shouldUpdate) return/*something changed*/;

      const { oldNodeObjs, newNodeObjs } = getNodesAffectedByStepMap(transaction, stepMapIndex, unmappedOldStart, unmappedOldEnd, codeBlockHeadingNodeNames);

      // -- check for same Node length --------------------------------------------
      if(oldNodeObjs.length !== newNodeObjs.length) {
        shouldUpdate = true/*Heading or CodeBlock was added or removed*/;
        return/*something changed*/;
      } /* else -- same number of Nodes */

      for(let i=0; i<oldNodeObjs.length; i++) {
        // -- check for same Node types -------------------------------------------
        if(oldNodeObjs[i].node.type.name !== newNodeObjs[i].node.type.name) {
          shouldUpdate = true/*Heading or CodeBlock was added or removed*/;
          return/*something changed*/;
        } /* else - same type, keep checking */

        // -- check for same Heading levels ---------------------------------------
        if(isHeadingNode(oldNodeObjs[i].node) && isHeadingNode(newNodeObjs[i].node)) {
          if(newNodeObjs[i].node.attrs[AttributeType.Level] !== oldNodeObjs[i].node.attrs[AttributeType.Level]) {
            shouldUpdate = true/*Heading level changed*/;
            return/*something changed*/;
          } /* else -- same level, keep checking */
        } /* else -- either or both are not Headings */
      }
    });
    if(shouldUpdate) return true/*something changed*/;
  }
  return false/*nothing changed*/;
};

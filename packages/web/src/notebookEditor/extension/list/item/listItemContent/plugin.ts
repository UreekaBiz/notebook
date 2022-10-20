import { Slice } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

import { getNodesAffectedByStepMap, getParagraphNodeType, isDocumentNode, isListItemContentNode, NodeName } from '@ureeka-notebook/web-service';

import { ALLOW_LIST_ITEM_CONTENT_META } from './update';

// ********************************************************************************
// == Constant ====================================================================
const listItemContentNodeSet = new Set([NodeName.LIST_ITEM_CONTENT]);

// == Plugin ======================================================================
// this Plugin prevents ListItemContent Nodes from ever being direct children of
// the Document node. This can happen when Lists are toggled back to Paragraphs
// or when they are deleted (e.g. through backspace)
export const listItemContentPlugin = () => {
  // -- Flag ----------------------------------------------------------------------
  // used to distinguish between a regular paste and a plain text paste,
  // whose presence has influence only when pasting inside ListItems
  // (SEE: #handlePaste below)
  let isPlainTextPaste = false/*default*/;

  return new Plugin({
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
      for(let i=0; i<transactions.length; i++) {
        const { maps } = transactions[i].mapping;

        // iterate over all maps in the Transaction
        for(let stepMapIndex = 0; stepMapIndex < maps.length; stepMapIndex++) {
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

    // -- Props -------------------------------------------------------------------
    props: {
      // ensure that whenever a single ListItemContent is pasted into a List,
      // it does not create a new ListItemContent, and its content gets appended
      handlePaste: (view, event, slice) => {
        // NOTE: pasting can occur throughout multiple ClipboardEvents, some
        //       of which might produce the empty Slice. If a 'true' is returned
        //       in between these multiple ClipboardEvents, the next ones won't be
        //       processed. Hence the check below
        if(slice.content.size < 1) return false/*(SEE: NOTE above)*/;

        const { selection } = view.state;
        const { $anchor } = selection;
        const { parent } = $anchor;

        if(!isListItemContentNode(parent)) return false/*let PM handle the event*/;
        const { tr } = view.state;

        try {
          // -- check for plain text paste ---------------------------------------
          if(isPlainTextPaste) {
            return false/*let PM handle the event */;
          } /* else -- not a plain text event, check if pasting as single block  */

          // -- check for single Atom paste ---------------------------------------
          const firstSliceChild = slice.content.firstChild;
          const pastingSingleChild = slice.content.childCount === 1;
          if(firstSliceChild && firstSliceChild.isAtom && pastingSingleChild) {
            tr.insert(tr.selection.from, firstSliceChild);
            view.dispatch(tr);
            return true/*event handled*/;
          } /* else -- not pasting a single Atom, check if pasting as single block  */

          // -- check for single Block paste ---------------------------------------
          let textBlockCount = 0;
          slice.content.descendants((node) => {
            if(node.isTextblock) {
              textBlockCount+=1;
            } /* else -- ignore */
          });
          if(firstSliceChild && textBlockCount === 1) {
            // since paste can occur several levels deep across Lists,
            // yet the above check guarantees that there is a
            // single ListItemContent being pasted, only paste
            // the last parent of said ListItemContent (which will
            // be a ListItem or a TaskListItem by contract) by descending
            let pastedListItemContent = firstSliceChild/*default*/;
            firstSliceChild.content.descendants(descendant => {
              if(isListItemContentNode(descendant)) {
                pastedListItemContent = descendant;
              } /* else -- do not change default */
            });

            // insert the content of the pasted ListItemContent
            tr.replaceSelection(new Slice(pastedListItemContent.content, 0/*use full Slice*/, 0/*use full Slice*/));

            view.dispatch(tr);
            return true/*event handled*/;
          } /* else -- not pasting a single Block, let PM handle the event */

          return false/*let PM handle the event*/;
        } catch(error) {
          console.warn(`Something went wrong while handling paste in ListItemContent: ${error}`);
          return true/*prevent more side effects by marking event as handled*/;
        } finally {
          isPlainTextPaste = false/*default*/;
        }
      },

      // check to see if a paste is a plain text paste
      handleKeyDown: (view, event) => {
        if(event.shiftKey && event.metaKey && event.code === 'KeyV') {
          isPlainTextPaste = true/*set the flag*/;
          return false/*allow event to pass, it will be manually handled above*/;
        } else {
          isPlainTextPaste = false/*by definition*/;
          return false/*allow event to pass, it will be manually handled above*/;
        }
      },
    },
  });
};


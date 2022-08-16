import { Fragment, Mark, Node as ProseMirrorNode, Slice } from 'prosemirror-model';
import { Plugin, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { createMarkHolderNode, createParagraphNode, getNodesAffectedByStepMap, isHeadingNode, isMarkHolderNode, isParagraphNode, AttributeType, JSONMark, MarkName, NodeIdentifier, NodeName, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { parseStoredMarks } from './util';

// == Constant ====================================================================
// the Inclusion Set of Nodes that must maintain marks after their Content was
// deleted, if any marks were active when said Content was deleted
const blockNodesThatPreserveMarks = new Set([NodeName.HEADING, NodeName.PARAGRAPH]);

// == Plugin ======================================================================
export const MarkHolderPlugin = () => new Plugin<NotebookSchemaType>({
  // -- Transaction ---------------------------------------------------------------
  // when a BlockNode that must preserve Marks (SEE: blockNodesThatPreserveMarks Set
  // above) gets its Content removed but the Node is not deleted (i.e., the
  // Content's length was greater than zero and now its -exactly- zero), and there
  // were activeMarks, insert a MarkHolder Node that contains the respective Marks
  appendTransaction(transactions, oldState, newState) {
    if(newState.doc === oldState.doc) return/*no changes*/;
    const { tr } = newState;

    // do not allow cursor to be set behind a MarkHolder
    // NOTE: (this case is handled in the keyDown handler when Enter is pressed for
    //       expected behavior, i.e. inserting a Paragraph) above
    // SEE:  handleKeyDown below
    const nodeAfterPos = newState.doc.nodeAt(newState.selection.$anchor.pos);
    if(nodeAfterPos && isMarkHolderNode(nodeAfterPos)) {
      tr.setSelection(new TextSelection(tr.doc.resolve(newState.selection.$anchor.pos + 1)));
    } /* else -- no need to modify selection */

    // since transactions do not modify the state until they are dispatched,
    // ensure that nodes do not receive MarkHolders twice
    const nodesWithAddedMarkHolder = new Set<NodeIdentifier>();

    // NOTE: this Transaction has to step through all stepMaps without leaving
    //       early since any of them can leave a Block Node of the inclusion
    //       Set empty, and none should be missed, regardless of whether or not
    //       they had Content before (i.e. what matters is that there are Marks
    //       to store in the MarkHolder)
    for(let i=0;i<transactions.length;i++) {
      const { maps } = transactions[i].mapping;

      // iterate over all maps in the Transaction
      for(let stepMapIndex=0;stepMapIndex<maps.length;stepMapIndex++) {
        // (SEE: NOTE above)
        maps[stepMapIndex].forEach((unmappedOldStart, unmappedOldEnd) => {
          const { newNodePositions } = getNodesAffectedByStepMap(transactions[i], stepMapIndex, unmappedOldStart, unmappedOldEnd, blockNodesThatPreserveMarks);
          const { storedMarks } = transactions[i];

          for(let j=0;j<newNodePositions.length;j++) {
            // new Paragraphs must not inherit marks
            if(isParagraphNode(newNodePositions[j].node)) continue/*do not add MarkHolder*/;

            if(newNodePositions[j].node.content.size < 1/*no content*/ &&
                isHeadingNode(newNodePositions[i].node/*new Heading*/) &&
                !nodesWithAddedMarkHolder.has(newNodePositions[j].node.attrs[AttributeType.Id])/*previous Transactions haven't added a MarkHolder*/)
              {
                const marksArray = [newState.schema.marks[MarkName.BOLD].create()]/*empty Headings default to having Bold Mark*/;
                storedMarks?.forEach(mark => marksArray.push(mark))/*include any other stored Marks*/;

                tr.insert(newNodePositions[j].position + 1/*inside the parent Heading*/, createMarkHolderNode(newState.schema, { storedMarks: JSON.stringify(marksArray) }));
                nodesWithAddedMarkHolder.add(newNodePositions[j].node.attrs[AttributeType.Id]);

                continue/*nothing left to do*/;
              }/* else -- not a Heading, do not add MarkHolder */
          }
        });
      }
    }
    return tr;
  },

  // -- Props ---------------------------------------------------------------------
  props: {
    // .. Handler .................................................................
    // when the User types something and the cursor is currently past a MarkHolder,
    // delete the MarkHolder and ensure the User's input gets the MarkHolder marks
    // applied to it
    handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
      const { dispatch, tr, posBeforeAnchorPos } = getUtilsFromView(view),
            markHolder = view.state.doc.nodeAt(posBeforeAnchorPos);
      if(!markHolder || !isMarkHolderNode(markHolder)) return false/*let PM handle the event*/;

      const parentPos = Math.max(0/*don't go outside limits*/, posBeforeAnchorPos - 1)/*by contract --  MarkHolder gets inserted at start of parent Node*/;

      // NOTE: since the selection is not allowed to be behind a MarkHolder but
      //       expected behavior must be maintained on an Enter keypress, manually
      //       insert a Paragraph before the current node. If not done this way
      //       (i.e. letting PM insert the Paragraph by returning false), the
      //       resulting Selection has the wrong Cursor (in the new Paragraph instead
      //       of the Block Node where Enter was pressed)
      if(event.key === 'Enter') {
        const parentEndPos = parentPos + view.state.selection.$anchor.parent.nodeSize;

        // insert Paragraph below and set the Selection to the start of the inserted
        // Paragraph
        tr.setSelection(new TextSelection(tr.doc.resolve(parentEndPos), tr.doc.resolve(parentEndPos)))
          .insert(tr.selection.$anchor.pos, createParagraphNode(view.state.schema))
          .setSelection(new TextSelection(tr.doc.resolve(Math.max(0/*don't go outside limits*/, tr.selection.$anchor.pos - 1/*start of inserted Paragraph*/))));
        dispatch(tr);
        return true/*event handled*/;
      } /* else -- not handling Enter */

      // when pressing ArrowLeft, ensure expected behavior by setting the selection
      // behind the MarkHolder (manually) and then letting PM handle the event.
      // This only has to be done for ArrowLeft since Cursor is maintained past the
      // MarkHolder (i.e. to its right) by default.
      // (SEE: appendedTransaction above).
      if(event.key === 'ArrowLeft' && (posBeforeAnchorPos > 1/*not pressing ArrowLeft at the start of the document*/)) {
        const posBeforeMarkHolder = Math.max(0/*don't go outside limits*/, posBeforeAnchorPos - 1);
        tr.setSelection(new TextSelection(tr.doc.resolve(posBeforeMarkHolder), tr.doc.resolve(posBeforeMarkHolder)));
        dispatch(tr);
        return false/*PM handles default selection*/;
      } /* else -- not handling ArrowLeft */

      // if Backspace is pressed and a MarkHolder is present, delete it, set the
      // Selection accordingly and let PM handle the rest of the event
      if(event.key === 'Backspace') {
        tr.setSelection(new TextSelection(tr.doc.resolve(parentPos), tr.doc.resolve(parentPos + view.state.selection.$anchor.parent.nodeSize)))
          .deleteSelection();
        tr.setSelection(new TextSelection(tr.doc.resolve(tr.selection.$anchor.pos)));

        dispatch(tr);
        return true/*event handled*/;
      } /* else -- not handling Backspace */

      // NOTE: events that involve these keys are left to PM to handle. The only
      //       special case is a Paste operation, which is handled below
      //       (SEE: handlePaste, transformPasted)
      if(event.ctrlKey || event.altKey || event.metaKey || event.key.length > 1) {
        return false/*do not handle event*/;
      } /* else -- handle event */

      // Apply the stored marks to the current selection
      const storedMarks = markHolder.attrs[AttributeType.StoredMarks];
      if(!storedMarks) return false/*nothing to do, do not handle event*/;

      // Range to insert text and marks
      const from = tr.doc.resolve(posBeforeAnchorPos).pos,
            to = tr.doc.resolve(posBeforeAnchorPos + markHolder.nodeSize).pos;

      // Create marks from the stored marks attribute
      const JSONMarks = JSON.parse(storedMarks) as JSONMark[]/*by contract*/;
      const marks = JSONMarks.map(markName => Mark.fromJSON(view.state.schema, markName));

      // Insert the text and apply every stored mark into it
      tr.insertText(event.key, from, to);
      marks.forEach(mark => tr.addMark(from, to + 1/*exclusive selection -- add one to wrap whole text*/, mark));

      dispatch(tr);
      return true/*event handled*/;
    },

    // ............................................................................
    // when the User pastes something and the cursor is currently past a MarkHolder,
    // delete the MarkHolder and ensure the pasted slice gets the MarkHolder marks
    // applied to it
    handlePaste: (view: EditorView, event: ClipboardEvent, slice: Slice) => {
      const { dispatch, tr, posBeforeAnchorPos } = getUtilsFromView(view),
            markHolder = view.state.doc.nodeAt(posBeforeAnchorPos);
      if(!markHolder || !isMarkHolderNode(markHolder)) return false/*let PM handle the event*/;

      const storedMarks = markHolder.attrs[AttributeType.StoredMarks];
      if(!storedMarks) return false/*nothing to do, do not handle event*/;

      tr.setSelection(new TextSelection(tr.doc.resolve(posBeforeAnchorPos), tr.doc.resolve(posBeforeAnchorPos + markHolder.nodeSize)))
        .replaceSelection(slice);
      parseStoredMarks(view.state.schema, storedMarks).forEach(storedMark => tr.addMark(posBeforeAnchorPos, posBeforeAnchorPos + slice.size, storedMark));
      dispatch(tr);
      return true/*event handled*/;
    },

    // ensure no MarkHolders ever get pasted in places they should not be
    transformPasted(slice: Slice) {
      slice.content.descendants(descendantBlockNode => {
        if(!descendantBlockNode.isBlock) return/*nothing to do*/;

        // MarkHolders can only exist on empty BlockNodes as their only child
        const { firstChild } = descendantBlockNode;
        const canHaveMarkHolder = descendantBlockNode.content.size === 1/*pasted Node is empty*/
                                  && firstChild/*exists*/
                                  && isMarkHolderNode(firstChild)/*firstChild is a MarkHolder*/;
        if(canHaveMarkHolder) return/*nothing to do*/;

        const filteredContent: ProseMirrorNode<NotebookSchemaType>[] = [];
        descendantBlockNode.content.descendants(descendantInlineNode => {
          if(isMarkHolderNode(descendantInlineNode)) return/*nothing to do*/;

          filteredContent.push(descendantInlineNode);
        });

        descendantBlockNode.content = Fragment.fromArray(filteredContent);
      });
      return slice;
    },
  },
});

// == Util ========================================================================
// Utility function to return dispatch, tr and pos in the same object
const getUtilsFromView = (view: EditorView) => {
  const { dispatch } = view;
  const { tr } = view.state;
  const posBeforeAnchorPos = Math.max(0/*don't go outside limits*/, view.state.selection.$anchor.pos - 1)/*selection will be past the MarkHolder*/;

  return { dispatch, tr, posBeforeAnchorPos };
};

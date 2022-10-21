import { GapCursor } from 'prosemirror-gapcursor';
import { Fragment, NodeType } from 'prosemirror-model';
import { EditorState, NodeSelection, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { isNodeSelection, isNestedViewNode, isTextSelection, Attributes, AbstractDocumentUpdate, CreateBlockNodeDocumentUpdate, NodeName, ProseMirrorNodeContent } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Type ========================================================================
// NOTE: specific type is used to prevent all the existing commands from being
//       modified (i.e., those Commands should always have a defined dispatch
//       function, since the nested View for NestedViewNodes expects the type
//       of the function to match the one used by ProseMirror)
type NestedViewCommand = (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined/*match PM types*/) =>  boolean;

// == Insertion ===================================================================
/** set a NestedViewNode  */
export const insertNestedViewNodeCommand = (nodeType: NodeType, attributes: Partial<Attributes>): NestedViewCommand => (state, dispatch) => {
  const updatedTr = new InsertNestedViewNodeDocumentUpdate(nodeType, attributes).update(state, state.tr);
  if(dispatch && updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class InsertNestedViewNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly nodeType: NodeType, private readonly attributes: Partial<Attributes>) {/*nothing additional*/}

  /**
   * modify the given Transaction such that a NestedViewNode
   * is set and selected and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { $from, from, to, empty } = editorState.selection;
    if(!empty && this.nodeType.isBlock) return false/*do not allow*/;

    const fromIndex = $from.index();
    if(this.nodeType.isInline) {
      const text = editorState.doc.textBetween(from, to);
      let textContent: ProseMirrorNodeContent = Fragment.empty/*default*/;
      if(text.length > 0/*not empty, since empty Text Nodes cannot be created*/) {
        textContent = editorState.schema.text(text);
      } /* else -- Node will be created with no Text inside it*/

      const newNode = this.nodeType.create(this.attributes, textContent);
      if(!$from.parent.canReplaceWith(fromIndex, fromIndex, newNode.type)) return false/*cannot replace at index with Node of this type*/;

      tr.replaceSelectionWith(newNode);
      if(empty) {
        tr.setSelection(NodeSelection.create(tr.doc, $from.pos));
      } /* else -- do not set the Selection inside the Node, since the NodeView has not been registered in the outer View state, and an immediate Outer View undo would trigger an error */

      return tr;
    } /* else -- setting Block */

    const updatedTr = new CreateBlockNodeDocumentUpdate(this.nodeType.name as NodeName/*by definition*/, this.attributes).update(editorState, tr)/*updated*/;
    if(!updatedTr) return false/*default*/;

    // set the right Selection for the new Block. Since they are not regular
    // TextBlocks, the resulting Selection from CreateBlockNodeDocumentUpdate
    // is not enough and must be set manually so that the inner View opens
    try {
      if(isNodeSelection(updatedTr.selection)) {
        updatedTr.setSelection(NodeSelection.create(updatedTr.doc, updatedTr.selection.from));
        return updatedTr;
      } /* else -- Block was inserted in a TextBlock that already had content */

      if(isTextSelection(updatedTr.selection)) {
        // since the resulting TextSelection of a CreateBlockNodeDocumentUpdate
        // is inside the BlockNode, subtract 1 to select it
        updatedTr.setSelection(NodeSelection.create(updatedTr.doc, updatedTr.selection.from-1/*(SEE: Comment above)*/));
        return updatedTr;
      } /* else -- invalid Selection, return default */
    } catch(error) {
      return false/*the resulting Selection was invalid*/;
    }

    return false/*default*/;
  }
}

// == Behavior ====================================================================
/**
 * Determine the behavior for the Selection inside NestedViewNodes
 *
 * @param outerView The main EditorView containing this Node
 *
 * @param closeNodeCursorPos the desired cursor position upon closing this Node
 *
 * @param wouldLeaveInnerView whether the inner View of the Nested View Node
 * would be left after changing the Cursor given the key that was pressed
 *
 */
export const nestedViewNodeBehaviorCommand = (outerView: EditorView, nodeType: NodeType, closeNodeCursorPos: 'before' | 'after', wouldLeaveInnerView: boolean): NestedViewCommand => (state, dispatch) => {
  // (SEE: NOTE below)
  const updatedTransactions = new NestedViewNodeBehaviorDocumentUpdate(outerView, nodeType, closeNodeCursorPos, wouldLeaveInnerView).update(state, state.tr);
  if(dispatch && updatedTransactions) {
    const { innerViewTr, outerViewTr } = updatedTransactions;

    // update the inner View
    dispatch(innerViewTr);

    // update the outer View
    outerView.dispatch(outerViewTr);
    outerView.focus();
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
// NOTE: this class is not implementing AbstractDocumentUpdate since it needs
//       to return an updated Transaction for both the inner View and the
//       outer View of the Node
export class NestedViewNodeBehaviorDocumentUpdate {
  public constructor(
    private readonly outerView: EditorView,
    private readonly nodeType: NodeType,
    private readonly closeNodeCursorPos: 'before' | 'after',
    private readonly wouldLeaveInnerSelection: boolean
  ) {/*nothing additional*/}

  /**
   * modify the given Transaction such that the inner state of an
   * Editable Inline Node with Content changes (e.g. its Selection),
   * and return it
   *
   * NOTE: the editorState below refers to the state of the inner View
   */
  public update(editorState: EditorState, tr: Transaction) {
		// get Selections from both Views
		const outerState: EditorState = this.outerView.state;
		const { from : outerFrom, to : outerTo } = outerState.selection;
		const { empty: innerViewSelectionEmpty } = editorState.selection;

		if(!innerViewSelectionEmpty) return false/*only exit Node if Selection is empty*/;
    if(!this.wouldLeaveInnerSelection) return false/*let the inner View handle the Event*/;

		// close the Node by moving the cursor outside,
    // setting the outer View's Selection to be outside of the inner View
    // NOTE: the following checks ensure that, for NodeViewBlockNodes, the
    //       resulting Selection:
    //       1. is a TextSelection if a NodeBefore or a NodeAfter exists and
    //          said Node is not a NodeViewBlockNode (case 3)
    //       2. is a GapCursor Selection if there is no NodeBefore or NodeAfter
    //       3. considers the case where a GapCursor Selection must be set
    //          in between consecutive NodeViewBlockNodes
    const targetPos: number = (this.closeNodeCursorPos === 'before') ? outerFrom : outerTo;
    const { tr: outerViewTr } = outerState;
    outerViewTr.setSelection(TextSelection.create(outerState.doc, targetPos))/*default*/;

    if(this.nodeType.isInline) {
      return { innerViewTr: tr, outerViewTr };
    } /* else -- need to perform special checks */

    if(this.closeNodeCursorPos === 'before') {
      const nodeBefore = outerViewTr.selection.$anchor.nodeBefore;
      if(!nodeBefore || nodeBefore.isBlock) {
        outerViewTr.setSelection(new GapCursor(outerState.tr.doc.resolve(targetPos)));
      } /* else -- nodeBefore exists or it is not a LatexBlock */

      if(nodeBefore && !nodeBefore.isBlock) {
        outerViewTr.setSelection(TextSelection.create(outerState.doc, Math.max(0/*do not go behind the Doc*/, targetPos-1/*inside the nodeBefore*/)));
      } /* else -- GapCursor will work as expected */

    } else {
      const nodeAfter = outerViewTr.selection.$anchor.nodeAfter;
      if(!nodeAfter || nodeAfter.isBlock) {
        outerViewTr.setSelection(new GapCursor(outerState.tr.doc.resolve(targetPos)));
      } /* else -- nodeAfter exists or it is not a LatexBlock */

      if(nodeAfter && !nodeAfter.isBlock) {
        outerViewTr.setSelection(TextSelection.create(outerState.doc, Math.min(targetPos+1/*inside the nodeAfter*/, outerState.doc.nodeSize-2/*account for start and end of Doc*/)));
      } /* else -- GapCursor will work as expected */
    }

    return { innerViewTr: tr, outerViewTr };
  }
}

// == Backspace ===================================================================
/** ensure that backspacing when there is a NestedViewNode selects that Node */
export const nestedViewNodeBackspaceCommand: NestedViewCommand = (state, dispatch) => {
  const updatedTr = new nestedViewNodeBackspaceDocumentUpdate().update(state, state.tr);
  if(dispatch && updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class nestedViewNodeBackspaceDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * modify the given Transaction such that if there is a NestedViewNode right before
   * the cursor position, said Node is selected
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { $from } = editorState.selection;
    const nodeBefore = $from.nodeBefore;
    if(!nodeBefore) return false/*no Node before, nothing to do*/;

    if(isNestedViewNode(nodeBefore)){
      const index = $from.index($from.depth);
      const $beforePos = editorState.doc.resolve($from.posAtIndex(index-1/*previous Node*/));
      tr.setSelection(new NodeSelection($beforePos));
      return tr/*updated*/;
    } /* else -- no need to modify the Selection */

    return false/*not updated*/;
  }
}

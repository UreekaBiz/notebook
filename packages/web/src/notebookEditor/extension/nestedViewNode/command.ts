import { GapCursor } from 'prosemirror-gapcursor';
import { EditorState, NodeSelection, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { createEditableInlineNodeWithContent, isEditableInlineNodeWithContentNode, isNestedViewBlockNode, isNodeSelection, isTextSelection, AbstractDocumentUpdate, CreateBlockNodeDocumentUpdate, NodeName, EditableInlineNodeWithContentAttributes, DEFAULT_EDITABLE_INLINE_NODE_WITH_CONTENT_TEXT } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Type ========================================================================
// NOTE: specific type is used to prevent all the existing commands from being
//       modified (i.e., those Commands should always have a defined dispatch
//       function, since the nested View for NestedViewNodes expects the type
//       of the function to match the one used by ProseMirror)
type NestedViewCommand = (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined/*match PM types*/) =>  boolean;

// == Insertion ===================================================================
/** set a NestedViewNode  */
export const insertNestedViewNodeCommand = (nodeName: NodeName.NESTED_VIEW_BLOCK_NODE | NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT, attributes: Partial<EditableInlineNodeWithContentAttributes>): NestedViewCommand => (state, dispatch) => {
  const updatedTr = new InsertNestedViewNodeDocumentUpdate(nodeName, attributes).update(state, state.tr);
  if(dispatch && updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class InsertNestedViewNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly nodeName: NodeName.NESTED_VIEW_BLOCK_NODE | NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT, private readonly attributes: Partial<EditableInlineNodeWithContentAttributes>) {/*nothing additional*/}

  /**
   * modify the given Transaction such that a NestedViewNode
   * is set and selected and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { $from } = editorState.selection;
    const fromIndex = $from.index();

    let newNode = editorState.doc/*default*/;
    if(this.nodeName === NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT) {
      newNode = createEditableInlineNodeWithContent(editorState.schema, this.attributes, editorState.schema.text(DEFAULT_EDITABLE_INLINE_NODE_WITH_CONTENT_TEXT));
      if(!$from.parent.canReplaceWith(fromIndex, fromIndex, newNode.type)) return false/*cannot replace at index with Node of this type*/;

      tr.replaceSelectionWith(newNode)
        .setSelection(NodeSelection.create(tr.doc, $from.pos));
      return tr;
    } /* else -- setting nestedViewBlockNode */

    const updatedTr = new CreateBlockNodeDocumentUpdate(NodeName.NESTED_VIEW_BLOCK_NODE, this.attributes).update(editorState, tr)/*updated*/;
    if(!updatedTr) return false/*default*/;

    // set the right Selection for the new NVBN. Since they are not regular
    // TextBlocks, the resulting Selection from CreateBlockNodeDocumentUpdate
    // is not enough and must be set manually so that the inner View opens
    try {
      if(isNodeSelection(updatedTr.selection)) {
        updatedTr.setSelection(NodeSelection.create(updatedTr.doc, updatedTr.selection.from));
        return updatedTr;
      } /* else -- NVBN was inserted in a TextBlock that already had content */

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
 * @param closeNodeCursorPos
 * the desired cursor position upon closing this Node. -1 means the
 * cursor will be placed before the Node. +1 mean the
 * cursor will be placed afterwards
 *
 * @param requireOnBorder An exit condition based on cursor position and direction
 * that collapses the inner View only when the cursor is
 * about to leave the bounds of the Node
 *
 * @param requireEmptySelection if true, exit the node only if the inner
 *                              Selection is empty
 */
export const nestedViewNodeBehaviorCommand = (outerView: EditorView, nodeName: string,  closeNodeCursorPos: 1 | -1, requireOnBorder: boolean, requireEmptySelection: boolean = true/*default only leave Node if Selection empty*/): NestedViewCommand => (state, dispatch) => {
  // (SEE: NOTE below)
  const updatedTransactions = new NestedViewNodeBehaviorDocumentUpdate(outerView, nodeName, closeNodeCursorPos, requireOnBorder, requireEmptySelection).update(state, state.tr);
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
  public constructor(private readonly outerView: EditorView, private readonly nodeName: string, private readonly dir: 1 | -1, private readonly requireOnBorder: boolean, private readonly requireEmptySelection: boolean = true/*default only leave Node if Selection empty*/) {/*nothing additional*/}

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
		let { to : outerTo, from : outerFrom } = outerState.selection;
		let { to : innerTo, from : innerFrom } = editorState.selection;

		if(this.requireEmptySelection && innerTo !== innerFrom) return false/*only exit Node if Selection is empty*/;
		const currentPos: number = (this.dir > 0) ? innerTo : innerFrom;

    // if requireOnBorder, collapse only when the cursor is about
    // to leave the bounds of the Node
		if(this.requireOnBorder) {
			const nodeSize = editorState.doc.nodeSize - 2/*account for start and end of Node*/;

			if(this.dir > 0 && currentPos < nodeSize) return false/*exit conditions not met*/;
			if(this.dir < 0 && currentPos > 0) return false/*exit conditions not met*/;
		} /* else -- no need to check for border exit condition */

		// close the Node by moving the cursor outside,
    // setting the outer View's Selection to be outside of the inner View
    // NOTE: the following checks ensure that, for NodeViewBlockNodes, the
    //       resulting Selection:
    //       1. is a TextSelection if a NodeBefore or a NodeAfter exists and
    //          said Node is not a NodeViewBlockNode (case 3)
    //       2. is a GapCursor Selection if there is no NodeBefore or NodeAfter
    //       3. considers the case where a GapCursor Selection must be set
    //          in between consecutive NodeViewBlockNodes
    const targetPos: number = (this.dir < 0) ? outerFrom : outerTo;
    const { tr: outerViewTr } = outerState;
    outerViewTr.setSelection(TextSelection.create(outerState.doc, targetPos))/*default*/;

    if(this.nodeName === NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT) {
      return {
        innerViewTr: tr,
        outerViewTr,
      };
    } /* else -- need to perform special checks */

    if(this.dir < 0) {
      const nodeBefore = outerViewTr.selection.$anchor.nodeBefore;
      if(!nodeBefore || isNestedViewBlockNode(nodeBefore)) {
        outerViewTr.setSelection(new GapCursor(outerState.tr.doc.resolve(targetPos)));
      } /* else -- nodeBefore exists or it is not a nestedViewBlockNode */

      if(nodeBefore && !isNestedViewBlockNode(nodeBefore)) {
        outerViewTr.setSelection(TextSelection.create(outerState.doc, Math.max(0/*do not go behind the Doc*/, targetPos-1/*inside the nodeBefore*/)));
      } /* else -- GapCursor will work as expected */

    } else {
      const nodeAfter = outerViewTr.selection.$anchor.nodeAfter;
      if(!nodeAfter || isNestedViewBlockNode(nodeAfter)) {
        outerViewTr.setSelection(new GapCursor(outerState.tr.doc.resolve(targetPos)));
      } /* else -- nodeAfter exists or it is not a nestedViewBlockNode */

      if(nodeAfter && !isNestedViewBlockNode(nodeAfter)) {
        outerViewTr.setSelection(TextSelection.create(outerState.doc, Math.min(targetPos+1/*inside the nodeAfter*/, outerState.doc.nodeSize-2/*account for start and end of Doc*/)));
      } /* else -- GapCursor will work as expected */
    }

    return {
      innerViewTr: tr,
      outerViewTr,
    };
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

    if(isEditableInlineNodeWithContentNode(nodeBefore) || isNestedViewBlockNode(nodeBefore)){
      const index = $from.index($from.depth);
      const $beforePos = editorState.doc.resolve($from.posAtIndex(index-1/*previous Node*/));
      tr.setSelection(new NodeSelection($beforePos));
      return tr/*updated*/;
    } /* else -- no need to modify the Selection */

    return false/*not updated*/;
  }
}

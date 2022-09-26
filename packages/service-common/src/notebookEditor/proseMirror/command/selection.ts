import { GapCursor } from 'prosemirror-gapcursor';
import { Node as ProseMirrorNode, ResolvedPos } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { minFromMax } from '../../../util/number';
import { NodeName } from '../node';
import { NotebookSchemaType } from '../schema';
import { isGapCursorSelection } from '../selection';
import { ClearNodesDocumentUpdate } from './node';
import { AbstractDocumentUpdate, Command } from './type';
import { findCutBefore } from './util';

// ********************************************************************************
// == Type ========================================================================
export type SelectionRange = { from: number; to: number; }

// == Selection ===================================================================
/** set a TextSelection given the Range */
export const setTextSelectionCommand = (selectionRange: SelectionRange): Command => (state, dispatch) => {
  const updatedTr =  new SetTextSelectionDocumentUpdate(selectionRange).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class SetTextSelectionDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly selectionRange: SelectionRange) {/*nothing additional*/}
  /*
   * modify the given Transaction such that a TextSelection
   * is set across the given Range
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { doc } = editorState;
    const { from, to } = this.selectionRange;

    const minPos = TextSelection.atStart(doc).from;
    const maxPos = TextSelection.atEnd(doc).to;

    const resolvedFrom = minFromMax(from, minPos, maxPos);
    const resolvedEnd = minFromMax(to, minPos, maxPos);

    const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd);

    tr.setSelection(selection);
    return tr/*updated*/;
  }
}

/** set a NodeSelection at the given position */
export const setNodeSelectionCommand = (nodePos: number): Command => (state, dispatch) => {
  const updatedTr =  new SetNodeSelectionDocumentUpdate(nodePos).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class SetNodeSelectionDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly nodePos: number) {/*nothing additional*/}
  /*
   * modify the given Transaction such that a NodeSelection
   * is set at the given position
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { doc } = tr;
    tr.setSelection(NodeSelection.create(doc, minFromMax(this.nodePos, 0/*Doc start*/, doc.content.size)));
    return tr/*updated*/;
  }
}

// ................................................................................
// Delete the selection, if there is one.
export const deleteSelectionCommand: Command = (state, dispatch) => {
  const updatedTr =  new DeleteSelectionDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class DeleteSelectionDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the Selection
   * is deleted if it is not empty and return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    if(editorState.selection.empty) return false;
    tr.deleteSelection().scrollIntoView();
    return tr;
  }
}

// -- Block Selection -------------------------------------------------------------
/** ensure the Block at the Selection is deleted on Backspace if its empty */
export const blockBackspaceCommand = (blockNodeName: NodeName): Command => (state, dispatch) => {
  const updatedTr =  new BlockBackspaceDocumentUpdate(blockNodeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class BlockBackspaceDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly blockNodeName: NodeName) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the Block at the Selection
   * is deleted on Backspace if it is empty and return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { empty, $anchor, anchor } = editorState.selection,
    isAtStartOfDoc = anchor === 1/*first position inside the node, at start of Doc*/;

    if(!empty || $anchor.parent.type.name !== this.blockNodeName) return false/*let event be handled elsewhere*/;
    if(isAtStartOfDoc || !$anchor.parent.textContent.length) {
      const clearedNodesUpdatedTr = new ClearNodesDocumentUpdate().update(editorState, tr);
      return clearedNodesUpdatedTr/*updated*/;
    } /* else -- no need to delete blockNode */

    return false/*let Backspace event be handled elsewhere*/;
  }
}

/**
 * ensure correct arrow up behavior inside a Block Node by creating a new
 * {@link GapCursor} selection when the arrowUp key is pressed if the selection
 * is at the start of it
 */
export const blockArrowUpCommand = (blockNodeName: NodeName): Command => (state, dispatch) => {
  const updatedTr =  new BlockArrowUpDocumentUpdate(blockNodeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class BlockArrowUpDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly blockNodeName: NodeName) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the Selection becomes a
   * GapCursor Selection when the arrowUp key is pressed if the Selection
   * is at the start of it and return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { selection } = editorState;
    if(selection.$anchor.parent.type.name !== this.blockNodeName) return false/*let event be handled elsewhere*/;

    const isAtStart = selection.anchor === 1/*at the start of the doc*/;
    if(!isAtStart) return false/*no need to set GapCursor*/;

    tr.setSelection(new GapCursor(tr.doc.resolve(0/*at the start of the doc*/)));
    return tr/*updated*/;
  }
}

/**
 * ensure correct arrow up behavior inside a Block Node by creating a new
 * {@link GapCursor} selection when the arrowDown is pressed if the selection
 * is at the end of it
 */
export const blockArrowDownCommand = (blockNodeName: NodeName): Command => (state, dispatch) => {
  const updatedTr =  new BlockArrowDownDocumentUpdate(blockNodeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class BlockArrowDownDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly blockNodeName: NodeName) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the Selection becomes a
   * GapCursor Selection when the arrowDown key is pressed if the Selection
   * is at the start of it and return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { selection } = editorState;
    if(selection.$anchor.parent.type.name !== this.blockNodeName) return false/*node does not allow GapCursor*/;
    if(isGapCursorSelection(selection) && (selection.anchor !== 0)) return false/*selection already a GapCursor*/;

    const isAtEnd = selection.anchor === editorState.doc.nodeSize - 3/*past the Node, including the doc tag*/;
    if(!isAtEnd) return false/*no need to set GapCursor*/;

    tr.setSelection(new GapCursor(tr.doc.resolve(editorState.doc.nodeSize - 2/*past the Node*/)));
    return tr/*updated*/;
  }
}

// ................................................................................
/**
 * When the Selection is empty and at the start of a Text Block, select
 * the Node before that Text Block if possible
 */
export const selectNodeBackwardCommand: Command = (state, dispatch, view) => {
  const updatedTr =  new SelectNodeBackwardDocumentUpdate().update(state, state.tr, view);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class SelectNodeBackwardDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/ }

  /*
   * modify the given Transaction such that when the Selection is at
   * the start of a Text Block, the Node before it is selected
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>, view?: EditorView) {
    const { $head, empty } = editorState.selection;
    let $cutPos: ResolvedPos | null = $head/*default*/;
    if(!empty) return false;

    if($head.parent.isTextblock) {
      if(view ? !view.endOfTextblock('backward', editorState) : $head.parentOffset > 0) return false;
      $cutPos = findCutBefore($head);
    } /* else -- parent of $head is not a Text Block*/

    const node = $cutPos && $cutPos.nodeBefore;
    if(!node || !NodeSelection.isSelectable(node) || !$cutPos) return false;

    tr.setSelection(NodeSelection.create(editorState.doc, $cutPos.pos - node.nodeSize)).scrollIntoView();
    return tr/*updated*/;
  }
}

// ................................................................................
/** return the Node before the current {@link Selection}'s anchor */
const getNodeBefore = (selection: Selection) => {
  const { nodeBefore } = selection.$anchor;
  return nodeBefore;
};

/**
 * Replaces the node at the {@link Selection} of the given {@link Transaction} and
 * selects the new, replaced Node
 */
export const replaceAndSelectNodeCommand = (node: ProseMirrorNode<NotebookSchemaType>): Command => (state, dispatch) => {
  const updatedTr =  new ReplaceAndSelectNodeDocumentUpdate(node).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ReplaceAndSelectNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly node: ProseMirrorNode<NotebookSchemaType>) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that a Block Node is created
   * below the current Selection
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    tr.replaceSelectionWith(this.node);

    const nodeBefore = getNodeBefore(tr.selection),
          nodeBeforeSize = nodeBefore?.nodeSize ?? 0/*no node before -- no size*/;

    const resolvedPos = tr.doc.resolve(tr.selection.anchor - nodeBeforeSize);
    tr.setSelection(new NodeSelection(resolvedPos));

    return tr/*updated*/;
  }
}


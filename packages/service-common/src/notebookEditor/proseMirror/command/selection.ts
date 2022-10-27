import { Node as ProseMirrorNode, ResolvedPos } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { minFromMax } from '../../../util/number';
import { NodeName } from '../node';
import { getBlockNodeRange } from '../selection';
import { AbstractDocumentUpdate, Command } from './type';
import { findCutAfter, findCutBefore } from './util';

// ********************************************************************************
// == Type ========================================================================
export type SelectionRange = { from: number; to: number; }

// == Selection ===================================================================
/** set a Selection regardless of its type */
export const setSelectionCommand = (selection: Selection): Command => (state, dispatch) => {
  const updatedTr =  new SetSelectionDocumentUpdate(selection).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class SetSelectionDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly selection: Selection) {/*nothing additional*/}
  /*
   * modify the given Transaction such that the Selection is set and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.setSelection(this.selection);
    return tr/*updated*/;
  }
}

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
  public update(editorState: EditorState, tr: Transaction) {
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
  public update(editorState: EditorState, tr: Transaction) {
    const { doc } = tr;
    tr.setSelection(NodeSelection.create(doc, minFromMax(this.nodePos, 0/*Doc start*/, doc.content.size)));
    return tr/*updated*/;
  }
}

// ................................................................................
/** select the contents of the current parent Block Node */
export const selectBlockNodeContentCommand = (nodeName: NodeName): Command => (state, dispatch) => {
  const updatedTr =  new SelectBlockNodeContentDocumentUpdate(nodeName).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class SelectBlockNodeContentDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly nodeName: NodeName) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that the contents of the current
   * parent Block Node are selected and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { selection } = tr;
    const { $from, empty } = selection;

    if(!empty) return false/*do not overwrite Selection*/;
    if(!$from.parent.isTextblock) return false/*not a valid Node*/;
    if($from.parent.type.name !== this.nodeName) return false/*do not handle inside this Node*/;
    if($from.parent.textContent.length < 1) return false/*nothing to Select*/;

    const { from, to } = getBlockNodeRange(tr.selection);
    if(tr.selection.from === from && tr.selection.to === to) return false/*already selected all inside this Block*/;

    tr.setSelection(TextSelection.create(tr.doc, from, to));
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
  public update(editorState: EditorState, tr: Transaction) {
    if(editorState.selection.empty) return false;
    tr.deleteSelection().scrollIntoView();
    return tr;
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
  public update(editorState: EditorState, tr: Transaction, view?: EditorView) {
    const { $head, empty } = editorState.selection;
    let $cutPos: ResolvedPos | null = $head/*default*/;
    if(!empty) return false;

    if($head.parent.isTextblock) {
      if(view) {
        const wouldLeaveBlockIfBackward = view.endOfTextblock('backward', editorState);
        if(!wouldLeaveBlockIfBackward || $head.parentOffset > 0/*inside the parent*/) {
          return false;
        } /* else -- would leave the parent Text Block if Cursor goes backward, or the Cursor is at the start of the parent TextBlock*/
      } /* else -- View was not given */

      $cutPos = findCutBefore($head);
    } /* else -- parent of $head is not a Text Block*/

    const node = $cutPos && $cutPos.nodeBefore;
    if(!node || !NodeSelection.isSelectable(node) || !$cutPos) return false;

    tr.setSelection(NodeSelection.create(editorState.doc, $cutPos.pos - node.nodeSize)).scrollIntoView();
    return tr/*updated*/;
  }
}

/**
 * When the Selection is empty and at the end of a TextBlock, select
 * the Node coming after that TextBlock, if possible
 */
export const selectNodeForwardCommand: Command = (state, dispatch, view) => {
  const updatedTr =  new SelectNodeForwardDocumentUpdate().update(state, state.tr, view);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class SelectNodeForwardDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/ }

  /*
   * modify the given Transaction such that when the Selection is at
   * the end of a Text Block, the Node after it is selected
   */
  public update(editorState: EditorState, tr: Transaction, view?: EditorView) {
    const { $head, empty } = editorState.selection;
    if(!empty) return false/*do not allow*/;

    let $cut: ResolvedPos | null = $head/*default*/;

    if($head.parent.isTextblock) {
      if(view) {
        const wouldLeaveBlockIfForward = view.endOfTextblock('forward', editorState);
        if(!wouldLeaveBlockIfForward || $head.parentOffset < $head.parent.content.size) {
          return false;
        } /* else -- would leave the parent Text Block if Cursor goes forward, or the Cursor is past the end of the parent TextBlock*/
      } /* else -- View not given */

      $cut = findCutAfter($head);
    } /* else -- $head's parent is not a TextBlock */

    const node = $cut && $cut.nodeAfter;
    if(!node || !NodeSelection.isSelectable(node)) return false;

    tr.setSelection(NodeSelection.create(editorState.doc, $cut!.pos)).scrollIntoView();
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
export const replaceAndSelectNodeCommand = (node: ProseMirrorNode): Command => (state, dispatch) => {
  const updatedTr =  new ReplaceAndSelectNodeDocumentUpdate(node).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ReplaceAndSelectNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly node: ProseMirrorNode) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that a Block Node is created
   * below the current Selection
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.replaceSelectionWith(this.node);

    const nodeBefore = getNodeBefore(tr.selection),
          nodeBeforeSize = nodeBefore?.nodeSize ?? 0/*no node before -- no size*/;

    const resolvedPos = tr.doc.resolve(tr.selection.anchor - nodeBeforeSize);
    tr.setSelection(new NodeSelection(resolvedPos));

    return tr/*updated*/;
  }
}


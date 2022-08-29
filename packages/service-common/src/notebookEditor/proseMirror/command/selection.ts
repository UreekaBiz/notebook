import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';

import { minFromMax } from '../../../util/number';
import { AttributeType } from '../attribute';
import { isTextNode } from '../extension/text';
import { NotebookSchemaType } from '../schema';
import { getSelectedNode, SelectionDepth } from '../selection';
import { AbstractDocumentUpdate, Command } from './type';

// ********************************************************************************
// == Type ========================================================================
export type SelectionRange = { from: number; to: number; }

// == Selection ===================================================================
/** set a TextSelection given the Range */
export const setTextSelectionCommand = (selectionRange: SelectionRange): Command => (state, dispatch) => {
  const updatedTr =  new SetTextSelectionDocumentUpdate(selectionRange).update(state, state.tr);
  dispatch(updatedTr);
  return true/*Command executed*/;
};
export class SetTextSelectionDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private selectionRange: SelectionRange) {/*nothing additional*/}
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
  dispatch(updatedTr);
  return true/*Command executed*/;
};
export class SetNodeSelectionDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private nodePos: number) {/*nothing additional*/}
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
/** @returns the node before the current {@link Selection}'s anchor */
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
  dispatch(updatedTr);
  return true/*Command executed*/;
};
export class ReplaceAndSelectNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private node: ProseMirrorNode<NotebookSchemaType>) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that a Bloc Node is created
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

// == Range =======================================================================
/**
 * set specified attribute to the specified value for the Nodes in the
 * current Selection
 */
export const updateAttributesInRangeCommand = (attribute: AttributeType, value: string, depth: SelectionDepth): Command => (state, dispatch) => {
  const updatedTr =  new UpdateAttributesInRangeDocumentUpdate(attribute, value, depth).update(state, state.tr);
  dispatch(updatedTr);
  return true/*Command executed*/;
};
export class UpdateAttributesInRangeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private attribute: AttributeType, private value: string, private depth: SelectionDepth) {/*nothing additional*/}
  /*
   * modify the given Transaction such that the Nodes in the current Selection
   * get the specified attribute updated to the specified value
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.setSelection(editorState.selection);
    const { from, to } = tr.selection;

    // its a grouped selection: iterate over the Nodes and set the style on each of them
    if(from !== to) {
      const { doc } = tr;
      doc.nodesBetween(from, to, (node, pos) => {
        if(!tr.doc || !node) return false/*nothing to do*/;
        if(isTextNode(node)) return false/*skip text Nodes since they cannot have attributes*/;

        const nodeAttrs = { ...node.attrs, [this.attribute]: this.value };
        tr.setNodeMarkup(pos, undefined/*preserve type*/, nodeAttrs);
        return true/*continue*/;
      });
    } else {
      const node = getSelectedNode(editorState, this.depth);
      if(!node) return tr/*no more updates to be performed*/;

      const nodeAttrs = { ...node.attrs, [this.attribute]: this.value };
      let pos = editorState.selection.$anchor.before(this.depth);
      // NOTE: there is a case when the Node size is 1. Any attempt to select the Node
      //       based on its depth from the selection will select either the Node before
      //       or after that. This is a hack until a better one is found.
      if(node.nodeSize == 1) pos++;

      tr.setNodeMarkup(pos, undefined/*preserve type*/, nodeAttrs);
    }

    return tr/*updated*/;
  }
}


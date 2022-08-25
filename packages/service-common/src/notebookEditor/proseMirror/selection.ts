import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { NotebookSchemaType } from './schema';

// ********************************************************************************
// == Type ========================================================================
// .. Selection ...................................................................
// the depth of the selection from the current Node:
// * 0 is the base Node
// * `selection.depth` is the parent Node
export type SelectionDepth = number | undefined/*current Node*/;

// .. Position ....................................................................
// type of the function that is used to compute the position of a NodeView in the
// current Document
export type getPosType = boolean | (() => number);

// ................................................................................
/** Checks to see whether an object is a getPos function */
export const isGetPos = (object: any): object is (() => number) => typeof object === 'function';

/** Type guard that defines if a {@link Selection} is a {@link NodeSelection} */
export const isNodeSelection = (selection: Selection<NotebookSchemaType>): selection is NodeSelection<NotebookSchemaType> => 'node' in selection;

/** Checks whether the given {@link Selection} is of GapCursor type */
export const isGapCursorSelection = (selection: Selection<NotebookSchemaType>) => selection.toJSON().type === 'gapcursor';

// == Node ========================================================================
/** @returns currently selected Node. The Node selection is based on the depth of
 *           the selection */
 export const getSelectedNode = (state: EditorState, depth?: SelectionDepth) => {
  // if depth is provided then an ancestor is returned
  const { selection } = state;
  if(depth !== undefined) return selection.$anchor.node(depth);

  // gets the selected Node based on its position
  const selectedNode = isNodeSelection(selection) ? selection.node : undefined/*no node selected*/;
  return selectedNode;
};

/** Gets all the ascendants of the current selected Node */
 export const getAllAscendantsFromSelection = (state: EditorState): (ProseMirrorNode | null | undefined)[] => {
  const { selection } = state;
  const { $anchor } = selection;

  const selectedNode = getSelectedNode(state);
  const ascendants = [selectedNode];

  // decreasing order of depth
  for(let i=$anchor.depth; i>= 0;i--) {
    const ascendant = $anchor.node(i);
    ascendants.push(ascendant);
  }

  return ascendants;
};

// --------------------------------------------------------------------------------
/**
 * @param selection The {@link Selection} that is resolved
 * @param tr The {@link Transaction} whose document is used to resolve the newSelection
 * @returns The new {@link Selection} that is used after the Transaction
 *          performs its modifications
 */
 export enum SelectionBias {
  LEFT = -1,
  RIGHT = 1
}
export const resolveNewSelection = (selection: Selection<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>, bias?: SelectionBias) => {
  if(isNodeSelection(selection)) {
    return new NodeSelection(tr.doc.resolve(selection.anchor));
  } /* else -- a Node is not selected */

  if(!selection.empty) {
    return new TextSelection(tr.doc.resolve(selection.anchor), tr.doc.resolve(selection.head));
  } /* else -- selection is empty */

  return Selection.near(tr.doc.resolve(selection.anchor), bias ? bias : SelectionBias.LEFT/*default*/);
};

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
 export const replaceAndSelectNode = (node: ProseMirrorNode<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>, dispatch: ((args?: any) => any) | undefined) => {
  if(dispatch) {
    tr.replaceSelectionWith(node);

    const nodeBefore = getNodeBefore(tr.selection),
          nodeBeforeSize = nodeBefore?.nodeSize ?? 0/*no node before -- no size*/;
    const resolvedPos = tr.doc.resolve(tr.selection.anchor - nodeBeforeSize);
    tr.setSelection(new NodeSelection(resolvedPos));
    dispatch(tr);
  } /* else -- called from can() (SEE: src/notebookEditor/README.md/#Commands) */

  return true/*command can be executed, selection can always be replaced*/;
};

// == Range =======================================================================
/**
 * computes the Range that holds all Nodes in between the start and end of the
 * Blocks located at the anchor and head of the given {@link Selection}
 */
 export const getBlockNodeRange = (selection: Selection) => ({
  from: selection.from - selection.$from.parentOffset,
  to: (selection.to - selection.$to.parentOffset) + selection.$to.parent.nodeSize - 2/*account for the start and end of the parent Node*/,
});

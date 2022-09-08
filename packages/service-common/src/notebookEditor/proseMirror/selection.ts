import { Node as ProseMirrorNode, ResolvedPos } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';

import { isListItemContentNode } from './extension/list/listItemContent';
import { NotebookSchemaType } from './schema';
import { isObject } from '../../util';

// ********************************************************************************
// == Type ========================================================================
// .. Selection ...................................................................
// the depth of the selection from the current Node:
// * 0 is the base Node
// * `selection.depth` is the parent Node
export type SelectionDepth = number | undefined/*current Node*/;

// .. Search ......................................................................
// type of the object that can passed to look for a ResolvedPos
export type LookInsideOf = EditorState | Selection | ResolvedPos;

// type of function used to check if a Node has a certain condition
export type NodePredicate = (node: ProseMirrorNode, pos: number) => boolean;

// .. Position ....................................................................
// type of the function that is used to compute the position of a NodeView in the
// current Document
export type getPosType = boolean | (() => number);

// return type of findParentNode (SEE: ./node/util.ts)
export type ParentNodePosition = {
  posBeforeNode: number/*position directly before the Node*/;
  depth: number/*the depth of the Node. Equal to 0 is the Node is the root*/;
  nodeStart: number/*the start position of the Node*/;
  node: ProseMirrorNode/*the looked for Node*/;
  nodeEnd: number/*the end position of the Node*/;
}

// ................................................................................
/** Checks to see whether an object is a getPos function */
export const isGetPos = (object: any): object is (() => number) => typeof object === 'function';

/** Type guard that defines if a value is a {@link Selection} */
export const isSelection = (value: unknown): value is Selection => {
  return isObject(value) && value instanceof Selection;
};

/** Type guard that defines if a {@link Selection} is a {@link NodeSelection} */
export const isNodeSelection = (selection: Selection<NotebookSchemaType>): selection is NodeSelection<NotebookSchemaType> => 'node' in selection;

/** Checks whether the given {@link Selection} is of GapCursor type */
const GAP_CURSOR = 'gapcursor';
export const isGapCursorSelection = (selection: Selection<NotebookSchemaType>) => selection.toJSON().type === GAP_CURSOR;

/** Check if the {@link Selection} is inside a ListItemContent Node */
export const isInsideList = (selection: Selection<NotebookSchemaType>) => isListItemContentNode(selection.$anchor.parent) || isListItemContentNode(selection.$head.parent);

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

// == Range =======================================================================
/**
 * computes the Range that holds all Nodes in between the start and end of the
 * Blocks located at the anchor and head of the given {@link Selection}
 */
 export const getBlockNodeRange = (selection: Selection) => ({
  from: selection.from - selection.$from.parentOffset,
  to: (selection.to - selection.$to.parentOffset) + selection.$to.parent.nodeSize - 2/*account for the start and end of the parent Node*/,
});

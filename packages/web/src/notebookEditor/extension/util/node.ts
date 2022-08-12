import { Editor } from '@tiptap/core';
import { GapCursor } from 'prosemirror-gapcursor';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';

import { NodeName, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { ExtensionName, SelectionDepth } from 'notebookEditor/model/type';

// ********************************************************************************
// -- Backspace --------------------------------------------------------------------
/** Ensures the block at the selection is deleted on backspace if its empty */
export const handleBlockBackspace = (editor: Editor, nodeName: NodeName) => {
  const { empty, $anchor } = editor.state.selection,
        isAtStartOfDoc = $anchor.pos === 1/*first position inside the node, at start of Doc*/;

  if(!empty || $anchor.parent.type.name !== nodeName) return false/*do not delete block node*/;
  if(isAtStartOfDoc || !$anchor.parent.textContent.length) {
    return editor.commands.clearNodes();
  } /* else -- no need to delete blockNode */

  return false/*do not delete*/;
};

// -- Cursor Behavior -------------------------------------------------------------
/**
 * Ensures correct arrow up behavior when inside a block Node with text content
 * by creating a new {@link GapCursor} selection when the arrowUp key is pressed
 * if the selection is at the start of its
 */
 export const handleBlockArrowUp = (editor: Editor, nodeName: NodeName) => {
  const { view, state } = editor,
        { selection, tr } = state,
        { dispatch } = view;
  if(selection.$anchor.parent.type.name !== nodeName) return false/*node does not allow GapCursor*/;

  const isAtStart = selection.$anchor.pos === 1/*at the start of the doc*/;
  if(!isAtStart) return false/*no need to set GapCursor*/;

  tr.setSelection(new GapCursor(tr.doc.resolve(0/*at the start of the doc*/)));
  dispatch(tr);
  return true/*created a GapCursor selection*/;
};

/**
 * Ensures correct arrow down behavior when inside a block Node with text content
 * by creating a new {@link GapCursor} selection when the arrowDown key is pressed
 * if the selection is at the end of its content
 */
export const handleBlockArrowDown = (editor: Editor, nodeName: NodeName) => {
  const { view, state } = editor,
        { doc, selection, tr } = state,
        { dispatch } = view;
  if(selection.$anchor.parent.type.name !== nodeName) return false/*node does not allow GapCursor*/;
  if(selection.toJSON().type === ExtensionName.GAP_CURSOR && (selection.$anchor.pos !== 0)) return false/*selection already a GapCursor*/;

  const isAtEnd = selection.$anchor.pos === doc.nodeSize - 3/*past the Node, including the doc tag*/;
  if(!isAtEnd) return false/*no need to set GapCursor*/;

  tr.setSelection(new GapCursor(tr.doc.resolve(doc.nodeSize - 2/*past the Node*/)));
  dispatch(tr);
  return true/*created a GapCursor selection*/;
};

// == Position ====================================================================
// type of the function that is used to compute the position of a NodeView in the
// current Document
export type getPosType = boolean | (() => number);

/** Checks to see whether an object is a getPos function */
export const isGetPos = (object: any): object is (() => number) => typeof object === 'function';

/** @returns the node before the current {@link Selection}'s anchor */
const getNodeBefore = (selection: Selection) => {
  const { nodeBefore } = selection.$anchor;
  return nodeBefore;
};

// == Selection ===================================================================
// -- Type ------------------------------------------------------------------------
/** Type guard that defines if a {@link Selection} is a {@link NodeSelection} */
export const isNodeSelection = (selection: Selection<NotebookSchemaType>): selection is NodeSelection<NotebookSchemaType> => 'node' in selection;

/** Checks to see whether a {@link NodeSelection}'s node is of the given {@link type} */
export const selectionIsOfType = (selection: Selection<NotebookSchemaType>, type: string): selection is NodeSelection<NotebookSchemaType> =>
  isNodeSelection(selection) && selection.node.type.name === type;

// --------------------------------------------------------------------------------
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
    return new NodeSelection(tr.doc.resolve(selection.$anchor.pos));
  } /* else -- a Node is not selected */

  if(!selection.empty) {
    return new TextSelection(tr.doc.resolve(selection.$anchor.pos), tr.doc.resolve(selection.$head.pos));
  } /* else -- selection is empty */

  return Selection.near(tr.doc.resolve(selection.$anchor.pos), bias ? bias : SelectionBias.LEFT/*default*/);
};

// ................................................................................
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

import { CommandProps, Editor } from '@tiptap/core';
import { customAlphabet } from 'nanoid';
import { GapCursor } from 'prosemirror-gapcursor';
import { Fragment, Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, Transaction } from 'prosemirror-state';

import { NotebookSchemaType, NodeIdentifier, NodeName } from '@ureeka-notebook/web-service';

import { ExtensionName } from 'notebookEditor/model/type';

import { mapOldStartAndOldEndThroughHistory } from './step';

// ********************************************************************************
// == Types =======================================================================
// -- Node ------------------------------------------------------------------------
export type NodeFound = { node: ProseMirrorNode<NotebookSchemaType>; position: number; };

// -- Content ---------------------------------------------------------------------
export type NodeContent = Fragment<NotebookSchemaType> | ProseMirrorNode<NotebookSchemaType> | Array<ProseMirrorNode<NotebookSchemaType>>;

// -- Position ---------------------------------------------------------------------
// Type of the function that is used to compute the position of a NodeView in the
// current document
export type getPosType = boolean | (() => number);

// == Type-Guard ==================================================================
/** Checks to see whether an object is a getPos function */
export const isGetPos = (object: any): object is (() => number) => typeof object === 'function';

// == Nodes =======================================================================
// -- Toggle ----------------------------------------------------------------------
/**
 * Toggles a block node if its currently active, or focuses it back if the type of
 * the current selection is 'gapCursor'
 */
export const toggleBlockNode = (props: CommandProps, nodeName: NodeName) => {
  if(props.editor.isActive(nodeName)) return props.commands.clearNodes();
  /* else -- insert node */

  const { selection } = props.view.state,
    prevPos = selection.$anchor.pos;

  if(selection.toJSON().type === ExtensionName.GAP_CURSOR) return props.chain().focus().setTextSelection(prevPos).run();

  return props.chain().setNode(nodeName).setTextSelection(prevPos).run();
};

// -- Backspace --------------------------------------------------------------------
/** Ensures the a node block is deleted on backspace if its empty */
export const handleBlockBackspace = (editor: Editor, nodeName: NodeName) => {
  const { empty, $anchor } = editor.state.selection;
  const isAtStart = $anchor.pos === 1/*first position inside the node*/;

  if(!empty || $anchor.parent.type.name !== nodeName) return false;
  if(isAtStart || !$anchor.parent.textContent.length) return editor.commands.clearNodes();

  return false;
};

// -- Cursor Behavior -------------------------------------------------------------
/** Ensures correct arrow up behavior when inside a block node with text content */
export const handleBlockArrowUp = (editor: Editor, nodeName: NodeName) => {
  const { view, state } = editor,
    { selection, tr } = state,
    { dispatch } = view;

  if(selection.$anchor.parent.type.name !== nodeName) return false;

  const isAtStart = selection.$anchor.pos === 1/*at the start of the doc*/;
  if(!isAtStart) return false;

  tr.setSelection(new GapCursor(tr.doc.resolve(0/*at the start of the doc*/)));
  dispatch(tr);
  return true;
};

/** Ensures correct arrow down behavior when inside a block node with text content */
export const handleBlockArrowDown = (editor: Editor, nodeName: NodeName) => {
  const { view, state } = editor,
    { doc, selection, tr } = state,
    { dispatch } = view;

  if(selection.toJSON().type === ExtensionName.GAP_CURSOR && (selection.$anchor.pos !== 0)) return true;
  if(selection.$anchor.parent.type.name !== nodeName) return false;

  const isAtEnd = selection.$anchor.pos === doc.nodeSize - 3/*past the node, including the doc tag*/;
  if(!isAtEnd) return false;

  tr.setSelection(new GapCursor(tr.doc.resolve(doc.nodeSize - 2/*past the node*/)));
  dispatch(tr);
  return true;
};

// == Util ========================================================================
/**
 * Finds the last node whose id matches the given nodeID
 *
 * @param rootNode The node whose descendants will be looked for the node with the given nodeID
 * @param nodeID The nodeID that will be looked for in the {@link rootNode}'s descendants
 * @returns The {@link NodeFound} object that corresponds to the looked for nodeID, or null if it wasn't found
 */
export const findLastNodeByID = (rootNode: ProseMirrorNode<NotebookSchemaType>, nodeID: NodeIdentifier): NodeFound | null => {
  let nodeFound: NodeFound | null = null;

  rootNode.descendants((node, position) => {
    if(node.attrs.id !== nodeID) return/*continue searching*/;

    nodeFound = { node, position };
  });

  return nodeFound;
};

/**
 * Looks for the parent node of the given {@link node} in the {@link rootNode}'s descendants
 *
 * @param rootNode The node whose descendants will be looked for the given {@link node}
 * @param node The {@link node} that is being searched for in the {@link rootNode}'s descendants
 * @returns The {@link NodeFound} object that corresponds to the looked for {@link node}, or null if it wasn't found
 */
export const getParentNode = (rootNode: ProseMirrorNode<NotebookSchemaType>, node: ProseMirrorNode<NotebookSchemaType>): NodeFound | null => {
  let nodeFound: NodeFound | null = null;

  rootNode.descendants((currentNode, position) => {
    currentNode.content.forEach(child => {
      if(child !== node) return/*continue searching*/;

      nodeFound = { node: currentNode, position };
    });
  });

  return nodeFound;
};

// ................................................................................
/**
 * Calculates how far inside a {@link childNode} is within its {@link parentNode}
 *
 * @param parentNode The parent node of the {@link childNode} whose offset is being calculated
 * @param childNode The {@link childNode} whose offset is being calculated
 * @returns The offset of the {@link childNode} into its {@link parentNode}
 */
export const getNodeOffset = (parentNode: ProseMirrorNode<NotebookSchemaType>, childNode: ProseMirrorNode<NotebookSchemaType>) => {
  let offset = 0/*default*/;
  parentNode.content.descendants((node, nodePos) => {
    if(node.attrs.id === childNode.attrs.id) offset = nodePos + 1/*account for 0 indexing*/;
  });

  return offset;
};

/**
 * Returns the size of the nodeBefore the current {@link Selection}'s anchor
 *
 * @param selection The current {@link Selection} that will be searched for a nodeBefore
 * @returns The size of the nodeBefore the current {@link Selection}'s anchor (0 if it does not exist)
 */
const getNodeBeforeSize = (selection: Selection<NotebookSchemaType>) => {
  const { nodeBefore } = selection.$anchor,
        nodeBeforeSize = nodeBefore && nodeBefore.nodeSize;
  if(!nodeBeforeSize) return 0/*doesn't exist so no size*/;

  return nodeBeforeSize;
};

// == Selection ===================================================================
/** type guard that defines if a {@link Selection} is a {@link NodeSelection} */
export const isNodeSelection = (selection: Selection<NotebookSchemaType>): selection is NodeSelection<NotebookSchemaType> => 'node' in selection;

// --------------------------------------------------------------------------------
/** Checks to see whether a {@link NodeSelection}'s node is of the given {@link type} */
export const selectionIsOfType = (selection: Selection<NotebookSchemaType>, type: string): selection is NodeSelection<NotebookSchemaType> =>
  isNodeSelection(selection) && selection.node.type.name === type;

/** Checks to see whether a {@link Selection}'s parent node is of the given {@link type} */
export const parentIsOfType = (selection: Selection<NotebookSchemaType>, type: string): selection is NodeSelection<NotebookSchemaType> =>
  selection.$anchor.parent.type.name === type;

// --------------------------------------------------------------------------------
/**
 * Gets the currently selected node given an editor instance
 *
 * @param state The current instance of the editor's state
 * @returns The currently selected node, or null if there is none
 */
 export const getSelectedNode = (state: EditorState, depth?: number) => {
  const { selection } = state;

  // is ancestor
  if(depth) return selection.$anchor.node(depth);

  // Gets the selected node based on its position
  const selectedNode = isNodeSelection(selection) ? selection.node : undefined/*no node selected*/;
  return selectedNode;
};

export const isFullySelected = (state: EditorState, node: ProseMirrorNode, pos: number): boolean => {
  const { selection } = state;
  const start = selection.$from.pos;
  const end = selection.$to.pos;

  return pos >= start - 1 && end > pos + node.content.size;
};

/**
 * Utility function that gets all the ascendants of the current selected node.
 *
 * @param state the current editor's {@link EditorState}
 */
 export const getAllAscendantsFromSelection = (state: EditorState): (ProseMirrorNode | null | undefined)[] => {
  const { selection } = state;
  const { $anchor } = selection;

  const selectedNode = getSelectedNode(state);
  const ascendants = [selectedNode];

  for(let i=$anchor.depth; i>=0; i--) {
    const ascendant = $anchor.node(i);
    ascendants.push(ascendant);
  }

  return ascendants;
};

// --------------------------------------------------------------------------------
/**
 * Determines the new {@link Selection} given the current selection state of the
 * given {@link Transaction}
 *
 * @param selection The {@link Selection} that will be resolved
 * @param tr The {@link Transaction} whose document will be used to resolve the newSelection
 * @returns The new {@link Selection} that will be used after the transaction performs its modifications
 */
export const resolveNewSelection = (selection: Selection<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) => {
  let nodeSelection = false;
  if(isNodeSelection(selection)) nodeSelection = true;

  if(nodeSelection) return new NodeSelection(tr.doc.resolve(selection.$anchor.pos));
  /* else -- textSelection */

  return Selection.near(tr.doc.resolve(selection.$anchor.pos), -1/*bias to the left*/);
};

/**
 * Checks to see whether a {@link Selection} is a {@link NodeSelection} and returns
 * the nodeID of the selected node, or throws an error if it does not exist. It must
 * therefore be used with context in mind
 */
export const getNodeIDFromSelection = (selection: Selection<NotebookSchemaType>) => {
  if(!isNodeSelection(selection)) throw new Error('Expected getNodeIDFromSelection to be called from a node selection');

  const { id } = selection.node.attrs;
  if(!id) throw new Error('Expected getNodeIDFromSelection to be called from a node with an ID');

  return id;
};

// ................................................................................
/** Returns the {@link ResolvedPos} of the anchor of the selection of the given {@link Transaction} */
export const getResolvedAnchorPos = (tr: Transaction<NotebookSchemaType>, extraOffset: number) => {
  const nodeBeforeSize = getNodeBeforeSize(tr.selection),
        resolvedPos = tr.doc.resolve((tr.selection.anchor + extraOffset) - nodeBeforeSize);
  return resolvedPos;
};

/** Returns the {@link ResolvedPos} of the node that is parent of the current {@link NodeSelection}'s node */
export const getResolvedParentSelectionByAnchorOffset = (selection: NodeSelection, tr: Transaction) => {
  const nodeOffset = getNodeOffset(selection.$anchor.parent, selection.node);
  const resolvedPos = tr.doc.resolve(selection.$anchor.pos - nodeOffset);
  return new NodeSelection<NotebookSchemaType>(resolvedPos);
};

// --------------------------------------------------------------------------------
/** Creates a {@link Fragment} with the content of the input node plus the given {@link appendedNode} */
export const createFragmentWithAppendedContent = (node: ProseMirrorNode<NotebookSchemaType>, appendedNode: ProseMirrorNode<NotebookSchemaType>) =>
    node.content.append(Fragment.from(appendedNode));

/**
 * Find the positions at which the differences between the content of two
 * nodes start and differ
 *
 * @param node1 The first {@link ProseMirrorNode} whose content will be compared
 * @param node2 The second {@link ProseMirrorNode} whose content will be compared
 * @returns The position at which the differences between the contents of the two
 *          nodes start, and the object that contains the positions at which the
 *          differences between the contents of the two nodes end. Since the end
 *          position may not be the same in both nodes, an object with the two
 *          positions is returned. If the content of the two nodes is the same,
 *          undefined is returned
 */
export const findContentDifferencePositions = (node1: ProseMirrorNode<NotebookSchemaType>, node2: ProseMirrorNode<NotebookSchemaType>) => {
  const docsDifferenceStart = node1.content.findDiffStart(node2.content),
        docDifferenceEnds = node1.content.findDiffEnd(node2.content);

  if(!docsDifferenceStart && docsDifferenceStart !== 0/*is a valid doc position*/) return;
  if(!docDifferenceEnds) return;

  return { docsDifferenceStart, docDifferenceEnds };
};

/**
 * Compute the nodes that were affected by the steps of the stepMapIndex of a transaction
 *
 * @param transaction The transaction whose affected ranges are being computed
 * @param stepMapIndex The stepMapIndex of the corresponding stepMap of the transaction
 * @param unmappedOldStart The default oldStart of the stepMap of the transaction
 * @param unmappedOldEnd The default oldEnd of the stepMap of the transaction
 * @param nodeNames The names of the nodes that are being looked for in the affected range
 * @returns The nodes of the specified types that existed in the affected range
 *          of the transaction before the steps were applied, and the nodes of the
 *          specified types that exist after the steps have been applied
 */
// NOTE: Separated into its own method since all logic that needs to check whether
//       some node was deleted in a transaction uses this approach
export const getNodesAffectedByStepMap = (transaction: Transaction<NotebookSchemaType>, stepMapIndex: number, unmappedOldStart: number, unmappedOldEnd: number, nodeNames: Set<NodeName>) => {
  // map to get the oldStart, oldEnd that account for history
  const { mappedOldStart, mappedOldEnd, mappedNewStart, mappedNewEnd } = mapOldStartAndOldEndThroughHistory(transaction, stepMapIndex, unmappedOldStart, unmappedOldEnd),

  oldNodeObjs = getNodesBetween(transaction.before, mappedOldStart, mappedOldEnd, nodeNames),
  newNodeObjs = getNodesBetween(transaction.doc, mappedNewStart, mappedNewEnd, nodeNames);

  return { oldNodeObjs, newNodeObjs };
};

/**
 * Create and return an array of {@link NodeFound} by looking at the nodes between
 * {@link #from} and {@link #to} in the given {@link #rootNode}, adding those nodes
 * whose type name is included in the given {@link #nodeNames} set. Very similar to
 * doc.nodesBetween, but specifically for {@link NodeFound} objects
 */
export const getNodesBetween = (rootNode: ProseMirrorNode<NotebookSchemaType>, from: number, to: number, nodeNames: Set<NodeName>) => {
  const nodesOfType: NodeFound[] = [];
  rootNode.nodesBetween(from, to, (node, position) => {
    if(nodeNames.has(node.type.name as NodeName/*by definition*/))
      nodesOfType.push({ node, position });
    /* else -- ignore node */
  });

  return nodesOfType;
};

/**
 * Computes the {@link NodeFound} array holding the {@link NodeFound} objects
 * that exist in the {@param oldNodeFoundArr} and no longer exist in the
 * {@link newNodeFoundArr}. Requires that the nodes in the {@link NodeFound}
 * arrays have an unique id attribute
 */
export const computeRemovedNodeObjs = (oldNodeFoundArr: NodeFound[], newNodeFoundArr: NodeFound[]) => {
  const oldNodeIDs = new Set<string>(oldNodeFoundArr.map(oldNodeFoundObj => oldNodeFoundObj.node.attrs.id)),
        newNodeIDs = new Set<string>(newNodeFoundArr.map(newNodeFoundObj => newNodeFoundObj.node.attrs.id)),
        removedIDs = new Set<string>();

  oldNodeIDs.forEach(oldNodeID => {
    if(!newNodeIDs.has(oldNodeID))
      removedIDs.add(oldNodeID);
    /* else -- node was still exists */
  });

  const removedNodeObjs = oldNodeFoundArr.filter(oldNodeObj => removedIDs.has(oldNodeObj.node.attrs.id));
  return removedNodeObjs;
};

// ................................................................................
/**
 * Replaces the node at the {@link Selection} of the given {@link Transaction} and
 * selects the new, replaced node
 */
export const replaceAndSelectNode = (node: ProseMirrorNode<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>, dispatch: ((args?: any) => any) | undefined) => {
  if(!dispatch) throw new Error('Dispatch function undefined when it should not');

  tr.replaceSelectionWith(node);

  const nodeBeforeSize = getNodeBeforeSize(tr.selection);
  const resolvedPos = tr.doc.resolve(tr.selection.anchor - nodeBeforeSize);
  tr.setSelection(new NodeSelection(resolvedPos));

  dispatch(tr);

  return true/*was replaced*/;
};

// == Unique Node Id ==============================================================
/**
 * Computes the corresponding id that the tag for a node will receive if needed.
 * Note that not all nodes require their view to have an ID, but all nodeViews
 * whose nodes make use of this functionality -must- have an ID attribute.
 */
export const nodeToTagID = (node: ProseMirrorNode<NotebookSchemaType>) => `${node.type.name}-${node.attrs.id}`;

// == Unique Node Id ==============================================================
// NOTE: at a minimum the id must be URL-safe (i.e. without the need to URL encode)
// NOTE: this is expected to be used within a given context (e.g. within a document)
//       and therefore does not need to have as much randomness as, say, UUIDv4
const customNanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10/*T&E*/);
export const generateNodeId = () => customNanoid();

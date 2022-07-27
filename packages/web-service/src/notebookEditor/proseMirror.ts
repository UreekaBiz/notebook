import { Editor, Content } from '@tiptap/core';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { NodeSelection, Selection, EditorState } from 'prosemirror-state';

import { getNodeName, NodeIdentifier, NodeName } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';

const log = getLogger(ServiceLogger.NOTEBOOK_EDITOR);

// FIXME: most of this needs to be moved to the service-common package
// ********************************************************************************
// == Types =======================================================================
export type NodeFound = { node: ProsemirrorNode; position: number; };

// ================================================================================
/**
 * Type guard that defines if a {@link Selection} is a {@link NodeSelection}
 *
 * @param editor an instance of {@link Editor} -- FIXME
 * @returns if true the Selection is a NodeSelection
 */
export const isNodeSelection = (selection: Selection): selection is NodeSelection => {
  return 'node' in selection;
};

/**
 * Checks to see if the parent node of the anchor of the current selection
 * is of a specific type
 *
 * @param selection The current {@link Selection} given the editor state
 * @param nodeName The {@link NodeName} whose type will be checked
 * @returns A boolean indicating whether or not the parent of the anchor of the current selection is of the given type
 */
export const isSelectionAnchorParentOfType = (selection: Selection, nodeName: NodeName) => {
  return selection.$anchor.parent.type.name === nodeName;
};

/**
 * Checks if given selection is a 'Manual Selection' (e.g. set by dragging the cursor
 * with the mouse or handling it with shift + the arrow keys)
 *
 * @param selection The {@link Selection} that will be checked
 * @returns A boolean indicating whether or not the given selection is considered to be 'manual'
 */
export const isManualSelection = (selection: Selection): boolean => {
  return selection.$head.pos - selection.$anchor.pos !== 0;
};

/**
 * Gets the JSON representation of the given {@link Editor}
 *
 * @param editor The current instance of the editor
 * @returns The JSON version of the editor
 */
export const getEditorJSONContent = (editor: Editor) => editor.state.doc.content.toJSON();

/**
 * Gets the currently selected node given an editor instance
 *
 * @param editor The current instance of the editor -- FIXME
 * @returns The currently selected node, or null if there is none
 */
export const getSelectedNode = (state: EditorState, depth?: number) =>  {
  const { selection } = state;

  // is ancestor
  if(depth) return selection.$anchor.node(depth);

  // Gets the selected node based on its position
  const selectedNode = state.doc.nodeAt(selection.$anchor.pos);
  return selectedNode;
};

/**
 * Retrieves the parent direct of a given node and its position.
 *
 * @param rootNode the root of the search
 * @param node a {@link ProsemirrorNode}
 * @returns an object with the Parent node of the children and it's position if
 *          it's found.
 */
 export const getParentNode = (rootNode: ProsemirrorNode, node: ProsemirrorNode): NodeFound | null => {
  let nodeFound: NodeFound | null = null/*no value*/;

  rootNode.descendants((currentNode, position) => {
    currentNode.content.forEach(child => {
      if(child !== node) { return /*continue searching*/; }

      nodeFound = { node: currentNode, position };
    });
    return undefined;
  });

  return nodeFound;
};

/**
 * Retrieves all the ascendants for the given node.
 *
 * @param rootNode the root of the search
 * @param node a {@link ProseMirrorNode}
 * @returns an array with all the ascendants of the given node including the given node.
 */
export const getAllAscendants = (rootNode: ProsemirrorNode, node: ProsemirrorNode): ProsemirrorNode[] => {
  const ascendants = [node];

  // Recursively gets all the ascendants of the given node.
  let parent: NodeFound | null;
  do {
    const currentNode = ascendants[ascendants.length - 1]/*first node*/;

    // Gets the parent of the last node, then updates the array of ascendants.
    parent = getParentNode(rootNode, currentNode);
    if(parent) ascendants.push(parent.node);
  } while(parent !== null);

  // Root node will always be the first ascendant Node
  ascendants.push(rootNode);
  // reverse the order
  return ascendants;
};

/**
 * Retrieves all the ascendants of the current selected node.
 *
 * @param editor an instance oif {@link Editor} -- FIXME
 */
export const getAllAscendantsFromSelection = (state: EditorState): (ProsemirrorNode | null | undefined)[]  => {
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

/**
 * Retrieves the direct grandparent of a given node and it's position.
 *
 * @param rootNode the root of the search
 * @param node a {@link ProsemirrorNode}
 * @returns an object with the grand parent node of the children and it's position if
 *          it's found.
 */
export const getGrandfatherNode = (rootNode: ProsemirrorNode, node: ProsemirrorNode): NodeFound | null => {
  const parentNodeObject = getParentNode(rootNode, node);
  if(!parentNodeObject) { return null/*no parent*/; }

  return getParentNode(rootNode, parentNodeObject.node);
};

/**
 * Searches for the last node that has the given id.
 *
 * @param rootNode the root of the search
 * @param nodeId the {@link NodeIdentifier} to search
 * @returns The node node found whose id matches the given id
 */
export const findLastNodeById = (rootNode: ProsemirrorNode, nodeId: NodeIdentifier): NodeFound | null=> {
  let nodeFound: NodeFound | null = null;

  rootNode.descendants((node, position) => {
    if(node.attrs.id !== nodeId) return /*continue searching*/;

    nodeFound = { node, position };
  });

  return nodeFound;
};

/**
 * Determines if a node with the given Id exists
 *
 * @param rootNode the root of the search
 * @param nodeId the {@link NodeIdentifier} to find
 * @returns true if the node exists
 */
export const nodeWithIdExists = (rootNode: ProsemirrorNode, nodeId: NodeIdentifier ): boolean => {
  return findLastNodeById(rootNode, nodeId) !== null;
};

/**
 * Checks if the node can be inserted on the current selection
 *
 * @param editor an instance of {@link Editor}
 * @param nodeName a {@link NodeName}
 * @param notAllowedInsideOf an array of {@link NodeName}s which this node is not
 *        allow to be inside of
 * @returns true if a the selection's parent type is not any of the nodes in the
 *        notAllowedInsideOf array
 */
export const performCreationChecks = (editor: Editor, nodeName: NodeName, notAllowedInsideOf: NodeName[]): boolean => {
  const { selection } = editor.state;
  if(isManualSelection(selection)) { return false/*do not allow if manual text selection*/; }

  const parentNodeName = getNodeName(selection.$anchor.parent);
  if(notAllowedInsideOf.includes(parentNodeName)) {
    log.info(`Not allowed to create a ${nodeName} inside ${parentNodeName} at the moment`);
    return false/*do not allow*/;
  } /* else -- FIXME */

  if(isNodeSelection(selection) && notAllowedInsideOf.includes(getNodeName(selection.node))) {
    log.info(`Not allowed to create a ${nodeName} inside ${getNodeName(selection.node)} at the moment`);
    return false/*do not allow*/;
  } /* else -- FIXME */

  return true/*valid place to create the node*/;
};

/**
 * Replaces the Node that corresponds to the given nodeId with the given Content.
 *
 * @param editor an instance of {@link Editor}
 * @param nodeId a {@link NodeName}
 * @param content the content which will replace the given Node
 *
 */
export const replaceNode = (editor: Editor, nodeId: NodeIdentifier, content: Content) => {
  const currentNode = findLastNodeById(editor.state.doc, nodeId);
  if(!currentNode) return/*nothing to do*/;

  const pos = currentNode.position;

  // case 1: selected node is the one that will be replaced
  const { selection } = editor.state;
  if(isNodeSelection(selection) && selection.node.attrs.id === currentNode.node.attrs.id) {
    editor.chain()
        .deleteSelection()
        .insertContent(content)
        .setNodeSelection(pos)
      .run();

    return/*work done*/;
  } /* else -- case 2 */

  // case 2: selection is not in the completion node by the time completion resolves
  editor.chain()
          .deleteRange({ from: pos, to: pos + currentNode.node.nodeSize })
          .insertContentAt(pos, content, { updateSelection: false })
        .run();
};

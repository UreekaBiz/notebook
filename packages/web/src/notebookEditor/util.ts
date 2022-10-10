import { Editor } from '@tiptap/react';
import { Selection } from 'prosemirror-state';

import { findNodeById, setSelectionCommand, setNodeSelectionCommand, setTextSelectionCommand, NodeIdentifier } from '@ureeka-notebook/web-service';

import { EDITOR_CONTAINER_ID } from 'notebookEditor/component/Editor';

import { CHIP_TOOL_INPUT } from './extension/shared/component/chipTool/ChipTool';

// convenience functions pertaining to the Editor or Toolbar
// ********************************************************************************
// == Focus =======================================================================
export const focusEditor = (editor: Editor, nodeId: NodeIdentifier | undefined/*none*/) => {
  try {
    const startOfDocSelection = Selection.atStart(editor.state.doc);

    // if there is no Editor (specifically the container that contains it) or the
    // caller doesn't want to focus a specific Element then simply set the focus to
    // the start of the Editor
    const container = document.getElementById(EDITOR_CONTAINER_ID);
    if(!container || !nodeId) {
      setSelectionCommand(startOfDocSelection)(editor.state, editor.view.dispatch);
      return/*nothing else to do*/;
    } /* else -- there is an Editor and the caller wants to focus a specific Element */

    const nodeFound = findNodeById(editor.state.doc, nodeId);
    if(!nodeFound) {
      // set to start of Doc since there's no other option
      setSelectionCommand(startOfDocSelection)(editor.state, editor.view.dispatch);
      return/*nothing else to do*/;
    } /* else -- node exists */

    // scrolls to the selected node and focus it
    // NOTE: the choice of scrolling and focusing instead of checking for a Node
    //       existing in the position and selecting it is T&E. (In the future a
    //       special function that checks for the initial render selection type
    //       and chooses what to do based on the type of the node might be used.)
    container.scrollTo(0, editor.view.coordsAtPos(nodeFound.position).top/*T&E*/);
    if(nodeFound.node.isAtom) {
      setNodeSelectionCommand(nodeFound.position)(editor.state, editor.view.dispatch);
    } else {
      const insideNodePos = nodeFound.position + nodeFound.node.nodeSize - 1/*inside the Node*/;
      setTextSelectionCommand({ from: insideNodePos, to: insideNodePos })(editor.state, editor.view.dispatch);
    }
  } finally {
    setTimeout(()=>editor.view.focus()/*after rendering*/);
  }
};

// --------------------------------------------------------------------------------
export const getFocusedNodeIdFromURL = (path: string) => {
  return path.split('#')[1/*after the '#'*/];
};

/**
 * focus the ChipTool input after a Command that inserts a new Node
 * (SEE: ChipTool.tsx)
 */
export const focusChipToolInput = (id: NodeIdentifier) => setTimeout(() => document.getElementById(`${id}-${CHIP_TOOL_INPUT}`)?.focus(), 100/*after React renders changes*/);

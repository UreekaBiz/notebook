import { Editor } from '@tiptap/react';

import { findNodeById, NodeIdentifier } from '@ureeka-notebook/web-service';

import { EDITOR_CONTAINER_ID } from 'notebookEditor/component/Editor';

// convenience functions pertaining to the focus of the Editor
// ********************************************************************************
export const focusEditor = (editor: Editor, focusedElementId: NodeIdentifier | undefined/*none*/) => {
  // if there is no Editor (specifically the div that contains it) or the caller
  // doesn't want to focus a specific Element then simply set the focus to the start
  // of the Editor
  const editorDiv = document.getElementById(EDITOR_CONTAINER_ID);
  if(!editorDiv || !focusedElementId) {
    editor.commands.focus('start');
    return/*nothing else to do*/;
  } /* else -- there is an Editor and the caller wants to focus a specific Element */

  const focusedNodeObject = findNodeById(editor.state, focusedElementId);
  if(!focusedNodeObject) {
    editor.commands.focus('start')/*set focus to start since there's no other option*/;
    return/*node with given id does not exist anymore / yet*/;
  } /* else -- focused node exists */

  // NOTE: the choice of scrolling and focusing instead of checking for a Node
  //       existing in the position and selecting it is T&E. (In the future a
  //       special function that checks for the initial render selection type
  //       and chooses what to do based on the type of the node might be used.)
  editorDiv.scrollTo(0, editor.view.coordsAtPos(focusedNodeObject.position).top/*T&E*/);
  editor.commands.focus(focusedNodeObject.position);
};

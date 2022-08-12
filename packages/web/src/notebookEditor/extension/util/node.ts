import { Editor } from '@tiptap/core';
import { GapCursor } from 'prosemirror-gapcursor';

import { NodeName } from '@ureeka-notebook/web-service';

import { ExtensionName } from 'notebookEditor/model/type';

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

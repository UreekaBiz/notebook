import { Editor } from '@tiptap/core';
import { Mark, MarkType } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';

import { createMarkHolderNode, getMarkName, isMarkHolderNode, markFromJSONMark, parseStringifiedMarksArray, stringifyMarksArray, AttributeType, Command, JSONNode, MarkHolderNodeType, MarkName, NotebookSchemaType } from '@ureeka-notebook/web-service';

// ********************************************************************************
// creates a MarkHolder Node holding the Marks corresponding to the given MarkNames
export const createMarkHolderJSONNode = (editor: Editor, markNames: MarkName[]): JSONNode => {
  const storedMarks = markNames.map(markName => editor.schema.marks[markName].create());
  const markHolder = createMarkHolderNode(editor.schema, { storedMarks: stringifyMarksArray(storedMarks) });

  return markHolder.toJSON() as JSONNode;
};

/**
 * Checks to see whether or not the first child of the parent of the current Editor
 * {@link Selection} is a MarkHolderNode. It returns it if it is, and otherwise it
 * returns false
 */
export const getMarkHolder = (state: EditorState) => {
  const { firstChild } = state.selection.$anchor.parent;
  if(firstChild && isMarkHolderNode(firstChild)) return firstChild;
  /* else -- firstChild does not exist or is not a MarkHolder */

  return undefined/*not found*/;
};

/**
 * Toggles a mark in the mark holder. This should be used when a mark is added to
 *  an empty node.
 *
 * NOTE: the chain parameter, when coming from a Command, must be the chain
 *       passed by CommandProps. Otherwise an 'applyingMismatchedTransaction'
 *       error gets thrown. This is the reason why the used chain is not taken from
 *       the editor parameter
 */
export const toggleMarkInMarkHolderCommand = (markHolder: MarkHolderNodeType, appliedMarkType: MarkType): Command => (state, dispatch) => {
  let newMarksArray: Mark[] = [];
  const storedMarks  = markHolder.attrs[AttributeType.StoredMarks];
  if(!storedMarks) return false/*nothing to do*/;

  if(parseStoredMarks(state.schema, storedMarks).some(mark => getMarkName(mark) === appliedMarkType.name)) {
    // already included, remove it
    newMarksArray = [...parseStoredMarks(state.schema, storedMarks).filter(mark => getMarkName(mark) !== appliedMarkType.name)];
  } else {
    // not included yet, add it
    newMarksArray = [...parseStoredMarks(state.schema, storedMarks), appliedMarkType.create()];
  }

  // (SEE: NOTE above)
  const { selection, tr } = state;
  if(!selection.$anchor.parent.isBlock) return false/*command cannot be executed, Selection parent is not a Block Node*/;

  const startOfParentNodePos = tr.doc.resolve(selection.anchor - selection.$anchor.parentOffset);
  const { pos: startingPos } = tr.selection.$anchor;
    tr.setSelection(new TextSelection(startOfParentNodePos, tr.doc.resolve(startOfParentNodePos.pos + markHolder.nodeSize)))
      .setNodeMarkup(tr.selection.anchor, undefined/*maintain type*/, { storedMarks: stringifyMarksArray(newMarksArray) })
      .setSelection(new TextSelection(tr.doc.resolve(startingPos)));

  dispatch(tr);
  return true/*Command executed*/;
};

/** Checks if a MarkHolder contains a given Mark in its storedMarks attribute */
export const inMarkHolder = (editor: Editor, markName: MarkName) => {
  const markHolder = getMarkHolder(editor.state);
  if(!markHolder) return false/*MarkHolder is not present*/;

  const storedMarks = markHolder.attrs[AttributeType.StoredMarks];
  if(!storedMarks) return false/*no stored Marks, false by definition*/;

  return parseStoredMarks(editor.state.schema, storedMarks).some(mark => getMarkName(mark) === markName);
};

/** Parses the stringified array of Marks and returns it as a {@link Mark} array*/
export const parseStoredMarks = (schema: NotebookSchemaType, stringifiedStoredMarks: string) =>
  parseStringifiedMarksArray(stringifiedStoredMarks).map(jsonMark => markFromJSONMark(schema, jsonMark));

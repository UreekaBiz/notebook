import { Editor } from '@tiptap/core';
import { EditorState } from 'prosemirror-state';

import { createMarkHolderNode, getMarkName, isMarkHolderNode, markFromJSONMark, parseStringifiedMarksArray, stringifyMarksArray, AttributeType, JSONNode, MarkName, NotebookSchemaType } from '@ureeka-notebook/web-service';

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

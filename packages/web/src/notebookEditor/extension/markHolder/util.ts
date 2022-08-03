import { ChainedCommands, Editor } from '@tiptap/core';
import { Mark, MarkType } from 'prosemirror-model';
import { Selection, TextSelection } from 'prosemirror-state';

import { createMarkHolderNode, isMarkHolderNode, JSONNode, MarkHolderNodeType, MarkName } from '@ureeka-notebook/service-common';

// ********************************************************************************
// creates a MarkHolder Node holding the Marks corresponding to the given MarkNames
export const createMarkHolderJSONNode = (editor: Editor, markNames: MarkName[]): JSONNode => {
  const storedMarks = markNames.map(markName => editor.schema.marks[markName].create());
  const markHolder = createMarkHolderNode(editor.schema, { storedMarks });

  return markHolder.toJSON() as JSONNode;
};

/**
 * Checks to see whether or not the first child of the parent of the current Editor
 * {@link Selection} is a MarkHolderNode. It returns it if it is, and otherwise it
 * returns false
 */
export const getMarkHolder = (editor: Editor) => {
  const { firstChild } = editor.state.selection.$anchor.parent;
  if(firstChild && isMarkHolderNode(firstChild)) return firstChild;
  /* else -- firstChild does not exist or is not a MarkHolder */

  return undefined/*not found*/;
};

/** Toggles a mark in the mark holder. This should be used when a mark is added to
 *  an empty node. */
export const toggleMarkInMarkHolder = (selection: Selection, chain: () => ChainedCommands, markHolder: MarkHolderNodeType, appliedMarkType: MarkType): boolean => {
  let newMarksArray: Mark[] = [];
  if(markHolder.attrs.storedMarks?.some(mark => mark.type.name === appliedMarkType.name)) {
    // already included, remove it
    newMarksArray = [...markHolder.attrs.storedMarks!/*defined by contract*/.filter(mark => mark.type.name !== appliedMarkType.name)];
  } else {
    // not included yet, add it
    newMarksArray = [...markHolder.attrs.storedMarks!/*defined by contract*/, appliedMarkType.create()];
  }

  return chain().focus().command((props) => {
    const { dispatch, tr } = props;
    if(!isMarkHolderNode(selection.$anchor.parent)) return false/*command cannot be executed, Selection parent is not a MarkHolder Node*/;

    const startOfParentNodePos = tr.doc.resolve(selection.$anchor.pos - selection.$anchor.parentOffset);
    const { pos: startingPos } = tr.selection.$anchor;
    if(dispatch) {
      tr.setSelection(new TextSelection(startOfParentNodePos, tr.doc.resolve(startOfParentNodePos.pos + markHolder.nodeSize)))
        .setNodeMarkup(tr.selection.$anchor.pos, undefined/*maintain type*/, { storedMarks: newMarksArray })
        .setSelection(new TextSelection(tr.doc.resolve(startingPos)));
    } /* else -- called from can() (SEE: src/notebookEditor/README.md/#Commands) */

    return true/*command can be executed*/;
  }).run();
};

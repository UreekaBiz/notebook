import { Mark, MarkType } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { getMarkName, isMarkActive, setMarkCommand, stringifyMarksArray, unsetMarkCommand, AbstractDocumentUpdate, AttributeType, Command, MarkName, MarkHolderNodeType } from '@ureeka-notebook/web-service';

import { getMarkHolder, parseStoredMarks } from './util';

// ********************************************************************************
/**
 * Checks whether the given Mark is active in a MarkHolder.
 * If it is not, toggles or sets it
 */
export const toggleOrSetMarkCommand = (markName: MarkName, markType: MarkType): Command => (state, dispatch) => {
  // if MarkHolder is defined toggle the Mark inside it
  const markHolder = getMarkHolder(state);
  if(markHolder) {
    return toggleMarkInMarkHolderCommand(markHolder, markType)(state, dispatch);
  } /* else -- MarkHolder is not present */

  if(isMarkActive(state, markName, {/*no attributes*/})) {
    return unsetMarkCommand(markName, false/*do not extend empty Mark Range*/)(state, dispatch);
  } /* else -- not toggling Bold, set it */

  return setMarkCommand(markName, {/*no attributes*/})(state, dispatch);
};

// --------------------------------------------------------------------------------
/**
 * Toggles a Mark in the MarkHolder. This should be used when a Mark is added to
 *  an empty Node.
 */
 export const toggleMarkInMarkHolderCommand = (markHolder: MarkHolderNodeType, appliedMarkType: MarkType): Command => (state, dispatch) => {
  const updatedTr = new ToggleMarkInMarkHolderDocumentUpdate(markHolder, appliedMarkType).update(state, state.tr);
  dispatch(updatedTr);
  return true/*Command executed*/;
};
export class ToggleMarkInMarkHolderDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly markHolder: MarkHolderNodeType, private readonly appliedMarkType: MarkType) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a Mark is toggled in the
   * MarkHolder and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    let newMarksArray: Mark[] = [];
    const storedMarks  = this.markHolder.attrs[AttributeType.StoredMarks];
    if(!storedMarks) return tr/*no updates*/;

    if(parseStoredMarks(editorState.schema, storedMarks).some(Mark => getMarkName(Mark) === this.appliedMarkType.name)) {
      // already included, remove it
      newMarksArray = [...parseStoredMarks(editorState.schema, storedMarks).filter(Mark => getMarkName(Mark) !== this.appliedMarkType.name)];
    } else {
      // not included yet, add it
      newMarksArray = [...parseStoredMarks(editorState.schema, storedMarks), this.appliedMarkType.create()];
    }

    // (SEE: NOTE above)
    const { selection } = editorState;
    if(!selection.$anchor.parent.isBlock) return tr/*no updates, Command cannot be executed, Selection parent is not a Block Node*/;

    const startOfParentNodePos = tr.doc.resolve(selection.anchor - selection.$anchor.parentOffset);
    const { pos: startingPos } = tr.selection.$anchor;
      tr.setSelection(new TextSelection(startOfParentNodePos, tr.doc.resolve(startOfParentNodePos.pos + this.markHolder.nodeSize)))
        .setNodeMarkup(tr.selection.anchor, undefined/*maintain type*/, { storedMarks: stringifyMarksArray(newMarksArray) })
        .setSelection(new TextSelection(tr.doc.resolve(startingPos)));

    return tr/*updated*/;
  }
}

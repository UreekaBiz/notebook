import { Mark, MarkType } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { getMarkName, isMarkActive, stringifyMarksArray, AbstractDocumentUpdate, AttributeType, Command, MarkName, MarkHolderNodeType, SetMarkDocumentUpdate, UnsetMarkDocumentUpdate } from '@ureeka-notebook/web-service';

import { getMarkHolder, parseStoredMarks } from './util';

// ********************************************************************************
/**
 * Checks whether the given Mark is active in a MarkHolder, and toggling or set it
 */
export const toggleOrSetMarkCommand = (markName: MarkName, markType: MarkType): Command => (state, dispatch) => {
  const updatedTr = new ToggleOrSetMarkDocumentUpdate(markName, markType).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ToggleOrSetMarkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly markName: MarkName, private readonly markType: MarkType) {/*nothing additional*/}

  /*
   * modify the given Transaction such that it is toggled or set depending on
   * whether or not the given MarkType is active in a MarkHolder
   */
  public update(editorState: EditorState, tr: Transaction) {
    // if MarkHolder is defined toggle the Mark inside it
    const markHolder = getMarkHolder(editorState);
    if(markHolder) {
      return new ToggleMarkInMarkHolderDocumentUpdate(markHolder, this.markType).update(editorState, editorState.tr);
    } /* else -- MarkHolder is not present */

    if(isMarkActive(editorState, this.markName, {/*no attributes*/ })) {
      return new UnsetMarkDocumentUpdate(this.markName, false/*do not extend empty Mark Range*/).update(editorState, editorState.tr);
    } /* else -- not toggling Bold, set it */

    return new SetMarkDocumentUpdate(this.markName, {/*no attributes*/}).update(editorState, editorState.tr);
  }
}

// --------------------------------------------------------------------------------
/**
 * Toggles a Mark in the MarkHolder. This should be used when a Mark is added to
 *  an empty Node.
 */
export const toggleMarkInMarkHolderCommand = (markHolder: MarkHolderNodeType, appliedMarkType: MarkType): Command => (state, dispatch) => {
  const updatedTr = new ToggleMarkInMarkHolderDocumentUpdate(markHolder, appliedMarkType).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ToggleMarkInMarkHolderDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly markHolder: MarkHolderNodeType, private readonly appliedMarkType: MarkType) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a Mark is toggled in the
   * MarkHolder and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    let newMarksArray: Mark[] = [];
    const storedMarks = this.markHolder.attrs[AttributeType.StoredMarks];
    if(!storedMarks) return false/*no Marks to store*/;

    if(parseStoredMarks(editorState.schema, storedMarks).some(Mark => getMarkName(Mark) === this.appliedMarkType.name)) {
      // already included, remove it
      newMarksArray = [...parseStoredMarks(editorState.schema, storedMarks).filter(Mark => getMarkName(Mark) !== this.appliedMarkType.name)];
    } else {
      // not included yet, add it
      newMarksArray = [...parseStoredMarks(editorState.schema, storedMarks), this.appliedMarkType.create()];
    }

    const { selection } = editorState;
    if(!selection.$anchor.parent.isBlock) return false/*cannot be updated, Selection parent is not a Block Node*/;

    const startOfParentNodePos = tr.doc.resolve(selection.anchor - selection.$anchor.parentOffset);
    const { pos: startingPos } = tr.selection.$anchor;
    tr.setSelection(new TextSelection(startOfParentNodePos, tr.doc.resolve(startOfParentNodePos.pos + this.markHolder.nodeSize)))
      .setNodeMarkup(tr.selection.anchor, undefined/*maintain type*/, { storedMarks: stringifyMarksArray(newMarksArray) })
      .setSelection(new TextSelection(tr.doc.resolve(startingPos)));

    return tr/*updated*/;
  }
}

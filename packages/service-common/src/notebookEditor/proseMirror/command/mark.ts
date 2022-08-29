import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { Attributes } from '../attribute';
import { getMarkAttributes, getMarkRange, isMarkActive, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';
import { AbstractDocumentUpdate, Command } from './type';

// ********************************************************************************
// == Setter ======================================================================
/** set a Mark across the current Selection */
export const setMarkCommand = (markName: MarkName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const updatedTr = new SetMarkDocumentUpdate(markName, attributes).update(state, state.tr);
  dispatch(updatedTr);
  return true/*Command executed*/;
};
export class SetMarkDocumentUpdate implements AbstractDocumentUpdate  {
  public constructor(private markName: MarkName, private attributes: Partial<Attributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a Mark
   * is set across the current Selection, and return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { empty, ranges } = tr.selection;
    const markType = editorState.schema.marks[this.markName];
    if(empty) {
      const oldAttributes = getMarkAttributes(editorState, this.markName);
      tr.addStoredMark(markType.create({ ...oldAttributes, ...this.attributes }));
    } else {
      ranges.forEach(range => {
        const from = range.$from.pos;
        const to = range.$to.pos;

        editorState.doc.nodesBetween(from, to, (node, pos) => {
          const trimmedFrom = Math.max(pos, from);
          const trimmedTo = Math.min(pos + node.nodeSize, to);
          const markTypeIsPresent = node.marks.find(mark => mark.type === markType);

          // if a Mark of the given type is already present, merge its
          // attributes. Otherwise add a new one
          if(markTypeIsPresent) {
            node.marks.forEach(mark => {
              if(markType === mark.type) {
                tr.addMark(trimmedFrom, trimmedTo, markType.create({ ...mark.attrs, ...this.attributes }));
              }
            });
          } else {
            tr.addMark(trimmedFrom, trimmedTo, markType.create(this.attributes));
          }
        });
      });
    }
    return tr;
  }
}

// --------------------------------------------------------------------------------
/**
 * Remove all Marks across the current Selection. If extendEmptyMarkRange,
 * is true, they will be removed even across (i.e. past) it
 */
export const unsetMarkCommand = (markName: MarkName, extendEmptyMarkRange: boolean): Command => (state, dispatch) => {
  const updatedTr = new UnsetMarkDocumentUpdate(markName, extendEmptyMarkRange).update(state, state.tr);
  dispatch(updatedTr);
  return true/*command executed*/;
};
export class UnsetMarkDocumentUpdate implements AbstractDocumentUpdate  {
  public constructor(private markName: MarkName, private extendEmptyMarkRange: boolean) {/*nothing additional*/}

  /**
   * modify the given Transaction such that all Marks are removed
   * across the current Selection. If extendEmptyMarkRange,
   * is true, they will be removed even across (i.e. past) it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const { selection } = editorState;
    const markType = editorState.schema.marks[this.markName];
    const { $from, empty, ranges } = selection;

    if(empty && this.extendEmptyMarkRange) {
      let { from, to } = selection;
      const attrs = $from.marks().find(mark => mark.type === markType)?.attrs;
      const range = getMarkRange($from, markType, attrs);

      if(range) {
        from = range.from;
        to = range.to;
      } /* else -- use Selection from and to */

      tr.removeMark(from, to, markType);
    } else {
      ranges.forEach(range => tr.removeMark(range.$from.pos, range.$to.pos, markType));
    }

    tr.removeStoredMark(markType);
    return tr;
  }
}

// --------------------------------------------------------------------------------
/** Unset or set the given Mark depending on whether or not it is currently active */
export const toggleMarkCommand = (markName: MarkName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const updatedTr = new ToggleMarkDocumentUpdate(markName, attributes).update(state, state.tr);
  dispatch(updatedTr);
  return true/*Command executed*/;
};
export class ToggleMarkDocumentUpdate implements AbstractDocumentUpdate  {
  public constructor(private markName: MarkName, private attributes: Partial<Attributes>) {/*nothing additional*/}

  /**
   * modify the given Transaction such that the given Mark is set or unset
   * depending on whether or not it is currently active
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    if(isMarkActive(editorState, this.markName, this.attributes)) {
      return new UnsetMarkDocumentUpdate(this.markName, false/*default not extend Mark Range*/).update(editorState, tr);
    } /* else -- Mark is not active, set it */

    return new SetMarkDocumentUpdate(this.markName, this.attributes).update(editorState, tr);
  }
}

// --------------------------------------------------------------------------------
/**
 * Checks to see whether the Selection currently contains a Range with a Mark
 * of the given name in it, and if it does, modifies it so that the Range covers
 * it completely
 */
export const extendMarkRangeCommand = (schema: NotebookSchemaType, markName: MarkName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const markType = schema.marks[markName];
  const { tr } = state;

  const { doc, selection } = tr;
  const { $from, from, to } = selection;

  // expand the current Selection if need be
  const range = getMarkRange($from, markType, attributes);
  if(range && range.from <= from && range.to >= to) {
    const newSelection = TextSelection.create(doc, range.from, range.to);
    tr.setSelection(newSelection);
  } /* else -- no need to expand the Selection */

  dispatch(tr);
  return true/*Command executed*/;
};

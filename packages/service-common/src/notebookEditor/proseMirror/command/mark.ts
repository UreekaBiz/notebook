import { MarkType } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { Attributes } from '../attribute';
import { getMarkAttributes, getMarkRange, markApplies, MarkName } from '../mark';
import { AbstractDocumentUpdate, Command } from './type';

// ********************************************************************************
// == Setter ======================================================================
/** set a Mark across the current Selection */
export const setMarkCommand = (markName: MarkName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const updatedTr = new SetMarkDocumentUpdate(markName, attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class SetMarkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly markName: MarkName, private readonly attributes: Partial<Attributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a Mark
   * is set across the current Selection, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
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
    return tr/*updated*/;
  }
}

// --------------------------------------------------------------------------------
/**
 * Remove all Marks across the current Selection. If extendEmptyMarkRange,
 * is true, they will be removed even across (i.e. past) it
 */
export const unsetMarkCommand = (markName: MarkName, extendEmptyMarkRange: boolean): Command => (state, dispatch) => {
  const updatedTr = new UnsetMarkDocumentUpdate(markName, extendEmptyMarkRange).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class UnsetMarkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly markName: MarkName, private readonly extendEmptyMarkRange: boolean) {/*nothing additional*/}

  /**
   * modify the given Transaction such that all Marks are removed
   * across the current Selection. If extendEmptyMarkRange,
   * is true, they will be removed even across (i.e. past) it
   */
  public update(editorState: EditorState, tr: Transaction) {
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
    return tr/*updated*/;
  }
}

// --------------------------------------------------------------------------------
// REF: https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.ts
/** Toggle the given Mark with the given name */
export const toggleMarkCommand = (markType: MarkType, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const updatedTr = new ToggleMarkDocumentUpdate(markType, attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ToggleMarkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly markType: MarkType, private readonly attributes: Partial<Attributes>) {/*nothing additional*/}

  /**
   * modify the given Transaction such that Mark with the given
   * Name is toggled
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { empty, $cursor, ranges } = editorState.selection as TextSelection;
    if((empty && !$cursor) || !markApplies(editorState.doc, ranges, this.markType)) return false;

    if($cursor) {
      if(this.markType.isInSet(editorState.storedMarks || $cursor.marks())) { tr.removeStoredMark(this.markType); }
      else { tr.addStoredMark(this.markType.create(this.attributes)); }
    } else {
      let rangeHasMark = false;
      for(let i = 0; !rangeHasMark && i < ranges.length; i++) {
        let { $from, $to } = ranges[i];
        rangeHasMark = editorState.doc.rangeHasMark($from.pos, $to.pos, this.markType);
      }

      for(let i = 0; i < ranges.length; i++) {
        let { $from, $to } = ranges[i];
        if(rangeHasMark) {
          tr.removeMark($from.pos, $to.pos, this.markType);
        } else {
          const nodeAfter$FromStart = $from.nodeAfter,
                nodeBefore$ToEnd = $to.nodeBefore;
          let from = $from.pos,
              to = $to.pos;

          let spaceStart = 0/*default no space to account for*/;
          if(nodeAfter$FromStart && nodeAfter$FromStart.text) {
            const execArr = /^\s*/.exec(nodeAfter$FromStart.text);
            if(execArr) {
              spaceStart = execArr[0/*leading white space*/].length;
            } /* else -- do not change default */
          } /* else -- do not change default */


          // NOTE: not using /\s*$/ like in the original PM implementation
          //       since this can cause a 'Polynomial regular
          //       expression used on uncontrolled data' LGTM warning
          let spaceEnd = 0/*default no space to account for*/;
          if(nodeBefore$ToEnd && nodeBefore$ToEnd.text) {
            spaceEnd = nodeBefore$ToEnd.text.length - nodeBefore$ToEnd.text.trimEnd().length;
          } /*  else -- do not change default */

          if(from + spaceStart < to) {
            from += spaceStart;
            to -= spaceEnd;
          } /* else -- do not modify Range */

          tr.addMark(from, to, this.markType.create(this.attributes));
        }
      }

      tr.scrollIntoView();
    }

    return tr/*updated*/;
  }
}

// --------------------------------------------------------------------------------
/**
 * Checks to see whether the Selection currently contains a Range with a Mark
 * of the given name in it, and if it does, modifies it so that the Range covers
 * it completely
 */
export const extendMarkRangeCommand = (markName: MarkName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const updatedTr = new ExtendMarkRangeDocumentUpdate(markName, attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ExtendMarkRangeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly markName: MarkName, private readonly attributes: Partial<Attributes>) {/*nothing additional*/}

  /**
   * Checks to see whether the Selection currently contains a Range with a Mark
   * of the given name in it, and if it does, modifies the Transaction so that
   * the Range covers it completely, and returns it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const markType = editorState.schema.marks[this.markName];

    const { doc, selection } = tr;
    const { $from, from, to } = selection;

    // expand the current Selection if need be
    const range = getMarkRange($from, markType, this.attributes);
    if(range && range.from <= from && range.to >= to) {
      const newSelection = TextSelection.create(doc, range.from, range.to);
      tr.setSelection(newSelection);
    } /* else -- no need to expand the Selection */

    return tr/*updated*/;
  }
}

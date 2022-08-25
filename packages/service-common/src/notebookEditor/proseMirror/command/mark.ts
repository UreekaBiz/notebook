import { Attributes } from '../attribute';
import { getMarkAttributes, getMarkRange, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';
import { Command } from './type';

// ********************************************************************************
// == Setter ======================================================================
export const setMarkCommand = (schema: NotebookSchemaType, markName: MarkName, attributes: Partial<Attributes>): Command => (state, dispatch) => {
  const { tr } = state;
  const { empty, ranges } = state.selection;
  const markType = schema.marks[markName];

  if(empty) {
    const oldAttributes = getMarkAttributes(state, markName);
    tr.addStoredMark(markType.create({ ...oldAttributes, ...attributes }));
  } else {
    ranges.forEach(range => {
      const from = range.$from.pos;
      const to = range.$to.pos;

      state.doc.nodesBetween(from, to, (node, pos) => {
        const trimmedFrom = Math.max(pos, from);
        const trimmedTo = Math.min(pos + node.nodeSize, to);
        const markTypeIsPresent = node.marks.find(mark => mark.type === markType);

        // if a Mark of the given type is already present, merge its
        // attributes. Otherwise add a new one
        if(markTypeIsPresent) {
          node.marks.forEach(mark => {
            if(markType === mark.type) {
              tr.addMark(trimmedFrom, trimmedTo, markType.create({ ...mark.attrs, ...attributes }));
            }
          });
        } else {
          tr.addMark(trimmedFrom, trimmedTo, markType.create(attributes));
        }
      });
    });
  }

  dispatch(tr);
  return true/*Command executed*/;
};

/**
 * Remove all Marks across the current Selection. If extendEmptyMarkRange,
 * is true, they will be removed even across it
 */
export const unsetMarkCommand = (markName: MarkName, extendEmptyMarkRange: boolean): Command => (state, dispatch) => {
  const { selection, tr } = state;
  const markType = state.schema.marks[markName];
  const { $from, empty, ranges } = selection;

  if(empty && extendEmptyMarkRange) {
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
  dispatch(tr);
  return true/*command executed*/;
};

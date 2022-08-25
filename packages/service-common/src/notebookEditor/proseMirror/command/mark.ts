import { MarkType, ResolvedPos } from 'prosemirror-model';

import { objectIncludes } from '../../../util';
import { Attributes, AttributeType } from '../attribute';
import { getMarkAttributes, MarkName } from '../mark';
import { isSameMarkInArray } from '../mark/util';
import { NotebookSchemaType } from '../schema';
import { Command } from './type';

// ********************************************************************************
/** Get the Range covered by a Mark */
const getMarkRange =($pos: ResolvedPos, markType: MarkType, attributes: Record<AttributeType | string, any> = {/*default no attributes*/}) => {
  let start = $pos.parent.childAfter($pos.parentOffset);

  if($pos.parentOffset === start.offset && start.offset !== 0/*not at the direct start of the Node*/) {
    start = $pos.parent.childBefore($pos.parentOffset);
  }/* else -- parentOffset different than start offset, or start offset right at the start of the Node*/

  if(!start.node) {
    return/*nothing to do*/;
  } /* else -- there is a direct child after the parentOffset */


  const mark = start.node.marks.find(mark => mark.type === markType && objectIncludes(mark.attrs, attributes));
  if(!mark) {
    return/*no Mark to compute a Range*/;
  } /* else -- compute Range */

  let startIndex = start.index;
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1/*past it*/;
  let endPos = startPos + start.node.nodeSize;

  // calculate the positions backwards and forwards from the children at startIndex
  // and endIndex respectively
  while(startIndex > 0/*haven't reached parent, going backwards*/ && mark.isInSet($pos.parent.child(startIndex - 1/*child at previous index*/).marks)) {
    startIndex -= 1/*go backwards to parent*/;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }
  while(endIndex < $pos.parent.childCount/*haven't reached parent end going forwards*/ && isSameMarkInArray($pos.parent.child(endIndex).marks, markType, attributes)) {
    endPos += $pos.parent.child(endIndex).nodeSize;
    endIndex += 1/*move forwards, away from parent*/;
  }

  return {
    from: startPos,
    to: endPos,
  };
};

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

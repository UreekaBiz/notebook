import { Mark as ProseMirrorMark, MarkType, Node as ProseMirrorNode, ResolvedPos, Schema } from 'prosemirror-model';

import { EditorState } from 'prosemirror-state';

import { objectIncludes } from '../../../util';
import { Attributes, AttributeType, AttributeValue } from '../attribute';
import { isTextNode } from '../extension/text';
import { MarkName, MarkRange } from './type';

// ********************************************************************************
// == Getter ======================================================================
// gets the given Mark from the given Node. Returns `undefined` if the Mark is not found.
export const getMark = (node: ProseMirrorNode, markName: MarkName) => {
  return node.marks.find(mark => mark.type.name === markName);
};

// creates a mark
export const createMark = (markName: MarkName, schema: Schema, attrs?: Partial<Attributes>) => {
  return schema.marks[markName].create(attrs);
};

// gets the value of the Mark from the given Node. Returns `undefined` if the Mark
// is not found or the Mark has no value.
export const getMarkValue = (node: ProseMirrorNode, markName: MarkName, attributeType: AttributeType): AttributeValue | undefined => {
  const mark = getMark(node, markName);
  const value = mark ? mark.attrs[attributeType] : undefined;

  return value;
};

// returns a string with the names of all allowed Marks for a Node
export const getAllowedMarks = (allowedMarks: MarkName[]) => allowedMarks.join(' ');

/** Get the Range covered by a Mark */
export const getMarkRange =($pos: ResolvedPos, markType: MarkType, attributes: Record<AttributeType | string, any> = {/*default no attributes*/}) => {
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

/**
 * look for Marks across current Selection and return the attributes of the Mark
 * that matches the given {@link MarkName} if it is found
 */
export const getMarkAttributes = (state: EditorState, markName: MarkName): Record<AttributeType | string, any> => {
const markType = state.schema.marks[markName];
const { from, to, empty } = state.selection;

const marks: ProseMirrorMark[] = [];
if(empty) {
  if(state.storedMarks) {
    marks.push(...state.storedMarks);
  } /* else -- there are no stored Marks */

  // add Marks at the $anchor if any.
  // The empty check above guarantees that $anchor and $head are the same
  marks.push(...state.selection.$anchor.marks());
} else {
  state.doc.nodesBetween(from, to, node => { marks.push(...node.marks); });
}

const mark = marks.find(markItem => markItem.type.name === markType.name);
if(!mark) {
  return {/*no attributes by definition*/};
} /* else -- there is a Mark present in the Selection, return its attributes */

return { ...mark.attrs };
};

/**
 * Check to see if the Mark that corresponds to the given {@link MarkName}
 * is present in the current Selection
 */
 export const isMarkActive = (state: EditorState, markName: MarkName, attributes: Record<AttributeType | string, any> = {/*default no attributes*/}): boolean => {
  const { schema, selection } = state;
  const { empty, ranges } = selection;
  const markType = schema.marks[markName];

  if(empty) {
    return !!(state.storedMarks || state.selection.$from.marks()).filter(mark => {
        if(!markType) {
          return true/*continue*/;
        } /* else -- check if types are the same */

        return markType === mark.type;
      })
      .find(mark => objectIncludes(mark.attrs, attributes));
  } /* else -- check the Selection range */

  let selectionRange = 0/*default*/;
  const markRanges: MarkRange[] = [];
  ranges.forEach(({ $from, $to }) => {
    const from = $from.pos,
          to = $to.pos;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if(!isTextNode(node) && !node.marks.length) {
        return/*nothing to do*/;
      } /* else -- node is Text and there are Marks present */

      const relativeFrom = Math.max(from, pos),
            relativeTo = Math.min(to, pos + node.nodeSize);

      const range = relativeTo - relativeFrom;
      selectionRange += range;
      markRanges.push(...node.marks.map(mark => ({ mark, from: relativeFrom, to: relativeTo })));
    });
  });

  if(selectionRange === 0) {
    return false/*nothing to do*/;
  } /* else -- compute the Range of the matched Mark */

  const matchedRange = markRanges.filter(markRange => {
      if(!markType) {
        return true/*continue*/;
      } /* else -- check for equality */

      return markType === markRange.mark.type;
    })
    .filter(markRange => objectIncludes(markRange.mark.attrs, attributes))
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0/*default*/);

  // compute the range of Marks that exclude the looked-for Mark
  // (e.g. for Marks that exclude other Marks)
  const excludedRange = markRanges.filter(markRange => {
      if(!markType) {
        return true/* continue */;
      } /* else -- check for exclusion*/

      return markType !== markRange.mark.type/*not the same type of Mark*/ &&
            markRange.mark.type.excludes(markType)/*Mark should be excluded*/;
    })
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0/*default*/);

  // only include the result of the excludeRange if there are matches
  const range = matchedRange > 0/*there are matches*/
    ? matchedRange + excludedRange
    : matchedRange;

  return range >= selectionRange;
};

/**
 * Check if any Marks in the given {@link ProseMirrorMark} array have the same
 * {@link MarkType} as the given one, as well as the same set of attributes, and
 * return the Mark that matches
 */
export const findSameMarkInArray = (marks: readonly ProseMirrorMark[], markType: MarkType, attributes: Record<AttributeType | string, any> = {}): ProseMirrorMark | undefined =>
  marks.find(mark => mark.type === markType && objectIncludes(mark.attrs, attributes));

/**
 * Check if any of the Marks in the given {@link ProseMirrorMark} array are of the
 * same type as the given {@link MarkType} and have the same attributes
 */
export const isSameMarkInArray = (marks: readonly ProseMirrorMark[], markType: MarkType, attributes: Record<AttributeType | string, any> = {}) => !!findSameMarkInArray(marks, markType, attributes);

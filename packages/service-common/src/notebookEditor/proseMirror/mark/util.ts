import { Mark as ProseMirrorMark, MarkType, Node as ProseMirrorNode, ResolvedPos, Schema } from 'prosemirror-model';

import { EditorState, SelectionRange } from 'prosemirror-state';

import { objectIncludes } from '../../../util';
import { Attributes, AttributeType, AttributeValue } from '../attribute';
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

// == Validation ==================================================================
// check if the given MarkType can be applied through the given Ranges
export const markApplies = (documentNode: ProseMirrorNode, ranges: readonly SelectionRange[], type: MarkType) => {
  for(let i=0; i<ranges.length; i++) {
    const { $from, $to } = ranges[i];
    let canApplyMark = $from.depth == 0
      ? documentNode.inlineContent && documentNode.type.allowsMarkType(type)
      : false;

    documentNode.nodesBetween($from.pos, $to.pos, (node) => {
      if(canApplyMark) {
        return false/*stop descending*/;
      } /* else -- check if Mark can be applied */

      canApplyMark = node.inlineContent && node.type.allowsMarkType(type);
      return true/*keep descending*/;
    });

    if(canApplyMark) {
      return true/*can apply Mark for Nodes in Range*/;
    } /* else -- return false */
  }

  return false/*cannot apply Mark for Nodes in Range*/;
};

// == Search ======================================================================
/**
 * get the Marks that exist in the given range of the given
 * Document {@link ProseMirrorNode}
 */
export const getMarksBetween = (from: number, to: number, doc: ProseMirrorNode): MarkRange[] => {
  const marksBetween: MarkRange[] = [];

  // get all inclusive marks on empty selection
  if(from === to) {
    doc.resolve(from).marks().forEach(mark => {
      const $pos = doc.resolve(from - 1);
      const range = getMarkRange($pos, mark.type);

      if(!range) return/*Mark does not span any range*/;

      marksBetween.push({ mark, ...range });
    });
  } else {
    doc.nodesBetween(from, to, (node, pos) => { marksBetween.push(...node.marks.map(mark => ({ from: pos, to: pos + node.nodeSize, mark }))); });
  }

  return marksBetween;
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

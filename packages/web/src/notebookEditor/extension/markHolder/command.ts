import { Mark, MarkType } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';

import { getMarkName, isMarkActive, setMarkCommand, stringifyMarksArray, unsetMarkCommand, Command, MarkName, MarkHolderNodeType, AttributeType } from '@ureeka-notebook/web-service';

import { getMarkHolder, parseStoredMarks } from './util';

// ********************************************************************************
/**
 * Checks whether the given Mark is active in a MarkHolder.
 * If it is not, toggles or sets it
 */
export const toggleOrSetMarkCommand = (markName: MarkName, markType: MarkType): Command => (state, dispatch) => {
  // if MarkHolder is defined toggle the mark inside it
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
 * Toggles a mark in the mark holder. This should be used when a mark is added to
 *  an empty node.
 *
 * NOTE: the chain parameter, when coming from a Command, must be the chain
 *       passed by CommandProps. Otherwise an 'applyingMismatchedTransaction'
 *       error gets thrown. This is the reason why the used chain is not taken from
 *       the editor parameter
 */
 export const toggleMarkInMarkHolderCommand = (markHolder: MarkHolderNodeType, appliedMarkType: MarkType): Command => (state, dispatch) => {
  let newMarksArray: Mark[] = [];
  const storedMarks  = markHolder.attrs[AttributeType.StoredMarks];
  if(!storedMarks) return false/*nothing to do*/;

  if(parseStoredMarks(state.schema, storedMarks).some(mark => getMarkName(mark) === appliedMarkType.name)) {
    // already included, remove it
    newMarksArray = [...parseStoredMarks(state.schema, storedMarks).filter(mark => getMarkName(mark) !== appliedMarkType.name)];
  } else {
    // not included yet, add it
    newMarksArray = [...parseStoredMarks(state.schema, storedMarks), appliedMarkType.create()];
  }

  // (SEE: NOTE above)
  const { selection, tr } = state;
  if(!selection.$anchor.parent.isBlock) return false/*command cannot be executed, Selection parent is not a Block Node*/;

  const startOfParentNodePos = tr.doc.resolve(selection.anchor - selection.$anchor.parentOffset);
  const { pos: startingPos } = tr.selection.$anchor;
    tr.setSelection(new TextSelection(startOfParentNodePos, tr.doc.resolve(startOfParentNodePos.pos + markHolder.nodeSize)))
      .setNodeMarkup(tr.selection.anchor, undefined/*maintain type*/, { storedMarks: stringifyMarksArray(newMarksArray) })
      .setSelection(new TextSelection(tr.doc.resolve(startingPos)));

  dispatch(tr);
  return true/*Command executed*/;
};

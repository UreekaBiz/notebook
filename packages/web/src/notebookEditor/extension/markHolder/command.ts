import { MarkType } from 'prosemirror-model';

import { isMarkActive, setMarkCommand, unsetMarkCommand, Command, MarkName } from '@ureeka-notebook/web-service';

import { getMarkHolder, toggleMarkInMarkHolderCommand } from './util';

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

  return setMarkCommand(state.schema, markName, {/*no attributes*/})(state, dispatch);
};

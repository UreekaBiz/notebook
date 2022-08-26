import { getBoldMarkType, isMarkActive, setMarkCommand, unsetMarkCommand, Command, MarkName } from '@ureeka-notebook/web-service';

import { getMarkHolder, toggleMarkInMarkHolderCommand } from 'notebookEditor/extension/markHolder/util';

// --------------------------------------------------------------------------------
export const toggleBoldCommand: Command = (state, dispatch) => {
  // if MarkHolder is defined toggle the mark inside it
  const markHolder = getMarkHolder(state);
  if(markHolder) {
    return toggleMarkInMarkHolderCommand(markHolder, getBoldMarkType(state.schema))(state, dispatch);
  } /* else -- MarkHolder is not present */

  if(isMarkActive(state, MarkName.BOLD, {/*no attributes*/})) {
    return unsetMarkCommand(MarkName.BOLD, false/*do not extend empty Mark Range*/)(state, dispatch);
  } /* else -- not toggling Bold, set it */

  return setMarkCommand(state.schema, MarkName.BOLD, {/*no attributes*/})(state, dispatch);
};


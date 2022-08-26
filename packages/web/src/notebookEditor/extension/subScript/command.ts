import { getSubScriptMarkType, isMarkActive, setMarkCommand, unsetMarkCommand, Command, MarkName } from '@ureeka-notebook/web-service';

import { getMarkHolder, toggleMarkInMarkHolderCommand } from 'notebookEditor/extension/markHolder/util';

// --------------------------------------------------------------------------------
export const toggleSubScriptCommand: Command = (state, dispatch) => {
  // if MarkHolder is defined toggle the mark inside it
  const markHolder = getMarkHolder(state);
  if(markHolder) {
    return toggleMarkInMarkHolderCommand(markHolder, getSubScriptMarkType(state.schema))(state, dispatch);
  } /* else -- MarkHolder is not present */

  if(isMarkActive(state, MarkName.SUB_SCRIPT, {/*no attributes*/})) {
    return unsetMarkCommand(MarkName.SUB_SCRIPT, false/*do not extend empty Mark Range*/)(state, dispatch);
  } /* else -- not toggling Bold, set it */

  return setMarkCommand(state.schema, MarkName.SUB_SCRIPT, {/*no attributes*/})(state, dispatch);
};


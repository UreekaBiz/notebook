import { getSuperScriptMarkType, isMarkActive, setMarkCommand, unsetMarkCommand, Command, MarkName } from '@ureeka-notebook/web-service';

import { toggleMarkInMarkHolderCommand, getMarkHolder } from 'notebookEditor/extension/markHolder/util';

// --------------------------------------------------------------------------------
export const toggleSuperScriptCommand: Command = (state, dispatch) => {
  // if MarkHolder is defined toggle the mark inside it
  const markHolder = getMarkHolder(state);
  if(markHolder) {
    return toggleMarkInMarkHolderCommand(markHolder, getSuperScriptMarkType(state.schema))(state, dispatch);
  } /* else -- MarkHolder is not present */

  if(isMarkActive(state, MarkName.SUPER_SCRIPT, {/*no attributes*/})) {
    return unsetMarkCommand(MarkName.SUPER_SCRIPT, false/*do not extend empty Mark Range*/)(state, dispatch);
  } /* else -- not toggling Bold, set it */

  return setMarkCommand(state.schema, MarkName.SUPER_SCRIPT, {/*no attributes*/})(state, dispatch);
};


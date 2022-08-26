import { getUnderlineMarkType, isMarkActive, setMarkCommand, unsetMarkCommand, Command, MarkName } from '@ureeka-notebook/web-service';

import { getMarkHolder, toggleMarkInMarkHolderCommand } from 'notebookEditor/extension/markHolder/util';

// --------------------------------------------------------------------------------
export const toggleUnderlineCommand: Command = (state, dispatch) => {
  // if MarkHolder is defined toggle the mark inside it
  const markHolder = getMarkHolder(state);
  if(markHolder) {
    return toggleMarkInMarkHolderCommand(markHolder, getUnderlineMarkType(state.schema))(state, dispatch);
  } /* else -- MarkHolder is not present */

  if(isMarkActive(state, MarkName.UNDERLINE, {/*no attributes*/})) {
    return unsetMarkCommand(MarkName.UNDERLINE, false/*do not extend empty Mark Range*/)(state, dispatch);
  } /* else -- not toggling Bold, set it */

  return setMarkCommand(state.schema, MarkName.UNDERLINE, {/*no attributes*/})(state, dispatch);
};


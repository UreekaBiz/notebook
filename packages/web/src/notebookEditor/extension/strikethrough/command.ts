import { getStrikethroughMarkType, isMarkActive, setMarkCommand, unsetMarkCommand, Command, MarkName } from '@ureeka-notebook/web-service';

import { getMarkHolder, toggleMarkInMarkHolderCommand } from 'notebookEditor/extension/markHolder/util';

// --------------------------------------------------------------------------------
export const toggleStrikethroughCommand: Command = (state, dispatch) => {
  // if MarkHolder is defined toggle the mark inside it
  const markHolder = getMarkHolder(state);
  if(markHolder) {
    return toggleMarkInMarkHolderCommand(markHolder, getStrikethroughMarkType(state.schema))(state, dispatch);
  } /* else -- MarkHolder is not present */

  if(isMarkActive(state, MarkName.STRIKETHROUGH, {/*no attributes*/})) {
    return unsetMarkCommand(MarkName.STRIKETHROUGH, false/*do not extend empty Mark Range*/)(state, dispatch);
  } /* else -- not toggling Strikethrough, set it */

  return setMarkCommand(state.schema, MarkName.STRIKETHROUGH, {/*no attributes*/})(state, dispatch);
};

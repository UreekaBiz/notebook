import { getItalicMarkType, isMarkActive, setMarkCommand, unsetMarkCommand, Command, MarkName } from '@ureeka-notebook/web-service';

import { toggleMarkInMarkHolderCommand, getMarkHolder } from 'notebookEditor/extension/markHolder/util';

// --------------------------------------------------------------------------------
export const toggleItalicCommand: Command = (state, dispatch) => {
  // if MarkHolder is defined toggle the mark inside it
  const markHolder = getMarkHolder(state);
  if(markHolder) {
    return toggleMarkInMarkHolderCommand(markHolder, getItalicMarkType(state.schema))(state, dispatch);
  } /* else -- MarkHolder is not present */

  if(isMarkActive(state, MarkName.ITALIC, {/*no attributes*/})) {
    return unsetMarkCommand(MarkName.ITALIC, false/*do not extend empty Mark Range*/)(state, dispatch);
  } /* else -- not toggling Bold, set it */

  return setMarkCommand(state.schema, MarkName.ITALIC, {/*no attributes*/})(state, dispatch);
};


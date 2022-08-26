import { Command, MarkName } from '@ureeka-notebook/web-service';

import { toggleOrSetMarkCommand } from '../markHolder/command';

// ********************************************************************************
export const toggleItalicCommand: Command = (state, dispatch) =>
  toggleOrSetMarkCommand(MarkName.ITALIC, state.schema.marks[MarkName.ITALIC])(state, dispatch);


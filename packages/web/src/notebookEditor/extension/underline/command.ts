import { Command, MarkName } from '@ureeka-notebook/web-service';

import { toggleOrSetMarkCommand } from '../markHolder/command';

// ********************************************************************************
export const toggleUnderlineCommand: Command = (state, dispatch) =>
  toggleOrSetMarkCommand(MarkName.UNDERLINE, state.schema.marks[MarkName.UNDERLINE])(state, dispatch);

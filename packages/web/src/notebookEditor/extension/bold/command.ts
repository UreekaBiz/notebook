import { Command, MarkName } from '@ureeka-notebook/web-service';

import { toggleOrSetMarkCommand } from '../markHolder/command';

// ********************************************************************************
export const toggleBoldCommand: Command = (state, dispatch) =>
  toggleOrSetMarkCommand(MarkName.BOLD, state.schema.marks[MarkName.BOLD])(state, dispatch);


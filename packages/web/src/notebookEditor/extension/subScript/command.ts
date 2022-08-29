import { Command, MarkName } from '@ureeka-notebook/web-service';

import { toggleOrSetMarkCommand } from '../markHolder/command';

// --------------------------------------------------------------------------------
export const toggleSubScriptCommand: Command = (state, dispatch) =>
  toggleOrSetMarkCommand(MarkName.SUB_SCRIPT, state.schema.marks[MarkName.SUB_SCRIPT])(state, dispatch);


import { Command, MarkName } from '@ureeka-notebook/web-service';

import { toggleOrSetMarkCommand } from '../markHolder/command';

// ********************************************************************************
export const toggleSuperScriptCommand: Command = (state, dispatch) =>
  toggleOrSetMarkCommand(MarkName.SUPER_SCRIPT, state.schema.marks[MarkName.SUPER_SCRIPT])(state, dispatch);



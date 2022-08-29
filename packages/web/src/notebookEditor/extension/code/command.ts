import { Command, MarkName } from '@ureeka-notebook/web-service';

import { toggleOrSetMarkCommand } from '../markHolder/command';

// ********************************************************************************
export const toggleCodeCommand: Command = (state, dispatch) =>
  toggleOrSetMarkCommand(MarkName.CODE, state.schema.marks[MarkName.CODE])(state, dispatch);


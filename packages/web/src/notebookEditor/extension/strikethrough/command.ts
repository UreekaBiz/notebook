import { Command, MarkName } from '@ureeka-notebook/web-service';

import { toggleOrSetMarkCommand } from '../markHolder/command';

// ********************************************************************************
export const toggleStrikethroughCommand: Command = (state, dispatch) =>
  toggleOrSetMarkCommand(MarkName.STRIKETHROUGH, state.schema.marks[MarkName.STRIKETHROUGH])(state, dispatch);

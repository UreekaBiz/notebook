import { CommandProps } from '@tiptap/core';

import { getStrikethroughMarkType, MarkName, CommandFunctionType } from '@ureeka-notebook/service-common';

import { getMarkHolder, toggleMarkInMarkHolder } from 'notebookEditor/extension/markHolder/util';

// ********************************************************************************
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [MarkName.STRIKETHROUGH]: {
      setStrikethrough: CommandFunctionType<typeof setStrikethroughCommand, ReturnType>;
      unsetStrikethrough: CommandFunctionType<typeof unsetStrikethroughCommand, ReturnType>;
      toggleStrikethrough: CommandFunctionType<typeof toggleStrikethroughCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const setStrikethroughCommand = () => ({ commands }: CommandProps) => commands.setMark(MarkName.STRIKETHROUGH);
export const unsetStrikethroughCommand = () => ({ commands }: CommandProps) => commands.unsetMark(MarkName.STRIKETHROUGH);
export const toggleStrikethroughCommand = () => ({ editor, chain, commands }: CommandProps) => {
  // if MarkHolder is defined toggle the mark inside it
  const markHolder = getMarkHolder(editor);
  if(markHolder) return toggleMarkInMarkHolder(editor.state.selection, chain, markHolder, getStrikethroughMarkType(editor.schema))/*nothing else to do*/;
  /* else -- MarkHolder is not present */

  return commands.toggleMark(MarkName.STRIKETHROUGH);
};

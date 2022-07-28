import { CommandProps } from '@tiptap/core';

import { CommandFunctionType, MarkName } from '@ureeka-notebook/web-service';

// ********************************************************************************
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [MarkName.STRIKETHROUGH]: {
      setStrikethrough: CommandFunctionType<typeof setStrikethroughCommand, ReturnType>;
      toggleStrikethrough: CommandFunctionType<typeof toggleStrikethroughCommand, ReturnType>;
      unsetStrikethrough: CommandFunctionType<typeof unsetStrikethroughCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const setStrikethroughCommand = () => ({ commands }: CommandProps) => commands.setMark(MarkName.STRIKETHROUGH);
export const toggleStrikethroughCommand = () => ({ commands }: CommandProps) => commands.toggleMark(MarkName.STRIKETHROUGH);
export const unsetStrikethroughCommand = () => ({ commands }: CommandProps) => commands.unsetMark(MarkName.STRIKETHROUGH);

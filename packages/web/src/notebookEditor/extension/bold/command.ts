import { CommandProps } from '@tiptap/core';

import { MarkName } from '@ureeka-notebook/web-service';

import { CommandFunctionType } from '../util/type';

// ********************************************************************************
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [MarkName.BOLD/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      setBold: CommandFunctionType<typeof setBoldCommand, ReturnType>;
      unsetBold: CommandFunctionType<typeof unsetBoldCommand, ReturnType>;
      toggleBold: CommandFunctionType<typeof toggleBoldCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const setBoldCommand = () => ({ commands }: CommandProps) => commands.setMark(MarkName.BOLD);
export const unsetBoldCommand = () => ({ commands }: CommandProps) => commands.unsetMark(MarkName.BOLD);
export const toggleBoldCommand = () => ({ commands }: CommandProps) => commands.toggleMark(MarkName.BOLD);

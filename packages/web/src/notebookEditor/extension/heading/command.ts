import { CommandProps } from '@tiptap/core';

import { isHeadingLevel, HeadingLevel, NodeName } from '@ureeka-notebook/web-service';

import { CommandFunctionType } from '../util/type';

// ********************************************************************************
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.HEADING/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      setHeading: CommandFunctionType<typeof setHeadingCommand, ReturnType>;
      toggleHeading: CommandFunctionType<typeof toggleHeadingCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const setHeadingCommand = (attributes: { level: HeadingLevel; }) => ({ commands }: CommandProps) => {
  if(!isHeadingLevel(attributes.level)) return false/*invalid command, level for heading not supported*/;

  return commands.setNode(NodeName.HEADING, attributes);
};

export const toggleHeadingCommand = (attributes: { level: HeadingLevel; }) => ({ editor, commands }: CommandProps) => {
  if(!isHeadingLevel(attributes.level)) return false/*invalid command, level for heading not supported*/;

  if(editor.isActive(NodeName.HEADING) && editor.state.selection.$anchor.parent.attrs.level === attributes.level/*is the same heading -- toggle*/) return commands.toggleNode(NodeName.PARAGRAPH, NodeName.HEADING, attributes);
  // else -- set normally

  return commands.toggleNode(NodeName.HEADING, NodeName.PARAGRAPH, attributes);
};

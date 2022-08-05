import { CommandProps } from '@tiptap/core';

import { getParentNode, isCodeBlockNode, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

import { toggleBlockNode } from 'notebookEditor/extension/util/node';

// ********************************************************************************
// == Type ========================================================================
// NOTE: Usage of ambient module to ensure command is TypeScript-registered
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.CODEBLOCK/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Toggle a code block */
      toggleCodeBlock:  CommandFunctionType<typeof toggleCodeBlockCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const toggleCodeBlockCommand = () => (commandProps: CommandProps) => {
  if(isCodeBlockNode(getParentNode(commandProps.editor.state.selection))) {
    return false/*do not allow codeBlocks to be toggable*/;
  }/* else -- create a codeBlock */

  return toggleBlockNode(commandProps, NodeName.CODEBLOCK);
};

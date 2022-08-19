import { CommandProps } from '@tiptap/core';

import { createBlockNodeBelow, generateNodeId, getParentNode, isCodeBlockNode, AttributeType, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Type ========================================================================
// NOTE: Usage of ambient module to ensure command is TypeScript-registered
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.CODEBLOCK/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Toggle a code block */
      toggleCodeBlock: CommandFunctionType<typeof toggleCodeBlockCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
export const toggleCodeBlockCommand = () => ({ editor, commands, tr, dispatch, view }: CommandProps) => {
  if(isCodeBlockNode(getParentNode(editor.state.selection))) {
    return false/*do not allow codeBlocks to be toggable*/;
  } /* else -- create a codeBlock */

  return createBlockNodeBelow(editor.schema, NodeName.CODEBLOCK, { [AttributeType.Id]: generateNodeId() })(tr, dispatch, view);
};

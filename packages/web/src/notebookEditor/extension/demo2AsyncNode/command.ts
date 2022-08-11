import { CommandProps } from '@tiptap/core';

import {  generateNodeId, getParentNode, isDemo2AsyncNode, AttributeType, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

// == Type ========================================================================
// NOTE: Usage of ambient module to ensure command is TypeScript-registered
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.DEMO_2_ASYNC_NODE/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Insert and select a Demo 2 Async Node */
      toggleDemo2AsyncNode: CommandFunctionType<typeof toggleDemo2AsyncNodeCommand, ReturnType>;
    };
  }
}
// == Implementation ==============================================================
export const toggleDemo2AsyncNodeCommand = () => ({ commands, editor }: CommandProps) => {
  if(isDemo2AsyncNode(getParentNode(editor.state.selection))) {
    return false/*do not allow demo2AsyncNodes to be toggable*/;
  } /* else -- create a demo2AsyncNode */

  return commands.setNode(NodeName.DEMO_2_ASYNC_NODE, { [AttributeType.Id]: generateNodeId() });};

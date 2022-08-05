import { CommandProps } from '@tiptap/core';

import { getParentNode, isDemo2AsyncNode, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

import { toggleBlockNode } from 'notebookEditor/extension/util/node';

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
export const toggleDemo2AsyncNodeCommand = () => (commandProps: CommandProps) => {
  if(isDemo2AsyncNode(getParentNode(commandProps.editor.state.selection))) {
    return false/*do not allow demo2AsyncNodes to be toggable*/;
  }/* else -- create a demo2AsyncNode */

  return toggleBlockNode(commandProps, NodeName.DEMO_2_ASYNC_NODE);
};

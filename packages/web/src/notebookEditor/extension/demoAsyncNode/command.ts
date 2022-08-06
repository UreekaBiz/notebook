import { CommandProps } from '@tiptap/core';

import { createDefaultDemoAsyncNodeAttributes, createDemoAsyncNodeNode, generateNodeId, AttributeType, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

import { replaceAndSelectNode, selectionIsOfType } from 'notebookEditor/extension/util/node';

// == Type ========================================================================
// NOTE: Usage of ambient module to ensure command is TypeScript-registered
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.DEMO_ASYNC_NODE/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Insert and select a Demo Async Node */
      insertDemoAsyncNode: CommandFunctionType<typeof insertAndSelectDemoAsyncNode, ReturnType>;
    };
  }
}
// == Implementation ==============================================================
// .. Insert ......................................................................
export const insertAndSelectDemoAsyncNode = () => (props: CommandProps) => {
  if(selectionIsOfType(props.editor.state.selection, NodeName.DEMO_ASYNC_NODE)) return false/*ignore if selected node already is a demo async node*/;

  const demoAsyncNode = createDemoAsyncNodeNode(props.editor.schema, { ...createDefaultDemoAsyncNodeAttributes(), [AttributeType.Id]: generateNodeId() } );
  return replaceAndSelectNode(demoAsyncNode, props.tr, props.dispatch);
};

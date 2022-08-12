import { CommandProps } from '@tiptap/core';

import { createDefaultDemoAsyncNodeAttributes, createDemoAsyncNodeNode, generateNodeId, getSelectedNode, isDemoAsyncNode, replaceAndSelectNode, AttributeType, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

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
  const node = getSelectedNode(props.editor.state);
  if(node && isDemoAsyncNode(node)) return false/*ignore if selected node already is a demo async node*/;

  const demoAsyncNode = createDemoAsyncNodeNode(props.editor.schema, { ...createDefaultDemoAsyncNodeAttributes(), [AttributeType.Id]: generateNodeId() } );
  return replaceAndSelectNode(demoAsyncNode, props.tr, props.dispatch);
};

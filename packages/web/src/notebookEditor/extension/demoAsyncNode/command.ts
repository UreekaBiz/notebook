import { createDefaultDemoAsyncNodeAttributes, createDemoAsyncNodeNode, generateNodeId, getSelectedNode, isDemoAsyncNode, replaceAndSelectNodeCommand, AttributeType, Command } from '@ureeka-notebook/web-service';

import { focusChipToolInput } from 'notebookEditor/util';

// ================================================================================
export const insertAndSelectDemoAsyncNodeCommand: Command = (state, dispatch) => {
  const node = getSelectedNode(state);
  if(node && isDemoAsyncNode(node)) return false/*ignore if selected node already is a demo async node*/;

  const id = generateNodeId();
  const demoAsyncNode = createDemoAsyncNodeNode(state.schema, { ...createDefaultDemoAsyncNodeAttributes(), [AttributeType.Id]: id } );
  replaceAndSelectNodeCommand(demoAsyncNode)(state, dispatch);
  focusChipToolInput(id);

  return true/*Command executed*/;
};

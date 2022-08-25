import { createCodeBlockReferenceNode, generateNodeId, getSelectedNode, isCodeBlockReferenceNode, replaceAndSelectNode, AttributeType, Command } from '@ureeka-notebook/web-service';

import { focusChipToolInput } from 'notebookEditor/util';

// ================================================================================
export const insertAndSelectCodeBlockReferenceCommand: Command = (state, dispatch) => {
  const node = getSelectedNode(state);
  if(node && isCodeBlockReferenceNode(node)) return false/*ignore if selected node already is a CodeBlockReference*/;

  const id = generateNodeId();
  const codeBlockReference = createCodeBlockReferenceNode(state.schema, { [AttributeType.Id]: id } );
  replaceAndSelectNode(codeBlockReference)(state, dispatch);
  focusChipToolInput(id);

  return true/*Command executed*/;
};

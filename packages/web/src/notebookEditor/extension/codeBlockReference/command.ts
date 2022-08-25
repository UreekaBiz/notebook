
import { createCodeBlockReferenceNode, generateNodeId, getSelectedNode, isCodeBlockReferenceNode, replaceAndSelectNode, AttributeType, Command, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

import { focusChipToolInput } from 'notebookEditor/util';

// == Type ========================================================================
// NOTE: Usage of ambient module to ensure command is TypeScript-registered
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.CODEBLOCK_REFERENCE/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Insert and select a CodeBlockReference */
      insertCodeBlockReference: CommandFunctionType<typeof insertAndSelectCodeBlockReferenceCommand, ReturnType>;
    };
  }
}
// == Implementation ==============================================================
// .. Insert ......................................................................
export const insertAndSelectCodeBlockReferenceCommand: Command = (state, dispatch) => {
  const node = getSelectedNode(state);
  if(node && isCodeBlockReferenceNode(node)) return false/*ignore if selected node already is a CodeBlockReference*/;

  const id = generateNodeId();
  const codeBlockReference = createCodeBlockReferenceNode(state.schema, { [AttributeType.Id]: id } );
  replaceAndSelectNode(codeBlockReference)(state, dispatch);
  focusChipToolInput(id);

  return true/*Command executed*/;
};

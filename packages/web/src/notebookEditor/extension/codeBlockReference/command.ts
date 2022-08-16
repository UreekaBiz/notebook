import { CommandProps } from '@tiptap/core';

import { createCodeBlockReferenceNode, getSelectedNode, isCodeBlockReferenceNode, replaceAndSelectNode, AttributeType, CommandFunctionType, NodeName, CodeBlockReferenceAttributes } from '@ureeka-notebook/web-service';

// == Type ========================================================================
// NOTE: Usage of ambient module to ensure command is TypeScript-registered
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.CODEBLOCK_REFERENCE/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Insert and select a CodeBlockReference */
      insertCodeBlockReference: CommandFunctionType<typeof insertAndSelectCodeBlockReference, ReturnType>;
    };
  }
}
// == Implementation ==============================================================
// .. Insert ......................................................................
export const insertAndSelectCodeBlockReference = ({ id }: Partial<CodeBlockReferenceAttributes>) => ({ dispatch, editor, tr }: CommandProps) => {
  const node = getSelectedNode(editor.state);
  if(node && isCodeBlockReferenceNode(node)) return false/*ignore if selected node already is a CodeBlockReference*/;

  const codeBlockReference = createCodeBlockReferenceNode(editor.schema, { [AttributeType.Id]: id } );
  return replaceAndSelectNode(codeBlockReference, tr, dispatch);
};

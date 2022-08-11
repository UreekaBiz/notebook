import { CommandProps } from '@tiptap/core';

import { createCodeBlockReferenceNode, generateNodeId, AttributeType, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

import { replaceAndSelectNode, selectionIsOfType } from 'notebookEditor/extension/util/node';

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
export const insertAndSelectCodeBlockReference = () => ({ dispatch, editor, tr }: CommandProps) => {
  if(selectionIsOfType(editor.state.selection, NodeName.CODEBLOCK_REFERENCE)) return false/*ignore if selected node already is a CodeBlockReference*/;

  const codeBlockReference = createCodeBlockReferenceNode(editor.schema, { [AttributeType.Id]: generateNodeId() } );
  return replaceAndSelectNode(codeBlockReference, tr, dispatch);
};

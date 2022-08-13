import { CommandProps } from '@tiptap/core';
import { TextSelection } from 'prosemirror-state';

import { createCodeBlockNode, createTextNode, getBlockNodeRange, generateNodeId, getParentNode, isCodeBlockNode, AttributeType, Command, CommandFunctionType, NodeName, NotebookSchemaType } from '@ureeka-notebook/web-service';

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

  if(editor.state.selection.empty) {
    return commands.setNode(NodeName.CODEBLOCK, { [AttributeType.Id]: generateNodeId() });
  } /* else -- ensure selected Content gets transformed into CodeBlock correctly */

  return setCodeBlockAcrossNodes(editor.schema)(tr, dispatch, view);
};

// --------------------------------------------------------------------------------
const setCodeBlockAcrossNodes = (schema: NotebookSchemaType): Command => (tr, dispatch, view) => {
  const { from, to } = getBlockNodeRange(tr.selection);
  const textContent = tr.doc.textBetween(from, to, '\n'/*insert for every Block Node*/);

  tr.setSelection(new TextSelection(tr.doc.resolve(from - 1/*account for start of parent at from*/), tr.doc.resolve(to)))
    .replaceSelectionWith(createCodeBlockNode(schema, { [AttributeType.Id]: generateNodeId() }, createTextNode(schema, textContent)));

  if(dispatch) dispatch(tr);
  return true/*can be done*/;
};

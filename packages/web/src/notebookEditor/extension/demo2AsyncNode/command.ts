import { CommandProps } from '@tiptap/core';
import { TextSelection } from 'prosemirror-state';

import { createTextNode, createDemo2AsyncNodeNode, getBlockNodeRange, generateNodeId, getParentNode, isDemo2AsyncNode, AttributeType, Command, CommandFunctionType, NodeName, NotebookSchemaType } from '@ureeka-notebook/web-service';

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
export const toggleDemo2AsyncNodeCommand = () => ({ editor, commands, tr, dispatch, view }: CommandProps) => {
  if(isDemo2AsyncNode(getParentNode(editor.state.selection))) {
    return false/*do not allow demo2AsyncNodes to be toggable*/;
  } /* else -- create a demo2AsyncNode */

  if(editor.state.selection.empty) {
    return commands.setNode(NodeName.DEMO_2_ASYNC_NODE, { [AttributeType.Id]: generateNodeId() });
  } /* else -- ensure selected Content gets transformed into Demo2AsyncNode correctly */

  return setDemo2AsyncNodeAcrossNodes(editor.schema)(tr, dispatch, view);
};

// --------------------------------------------------------------------------------
const setDemo2AsyncNodeAcrossNodes = (schema: NotebookSchemaType): Command => (tr, dispatch, view) => {
  const { from, to } = getBlockNodeRange(tr.selection);
  const textContent = tr.doc.textBetween(from, to, '\n'/*insert for every Block Node*/);

  tr.setSelection(new TextSelection(tr.doc.resolve(from - 1/*account for start of parent at from*/), tr.doc.resolve(to)))
    .replaceSelectionWith(createDemo2AsyncNodeNode(schema, { [AttributeType.Id]: generateNodeId() }, createTextNode(schema, textContent)));

  if(dispatch) dispatch(tr);
  return true/*can be done*/;
};

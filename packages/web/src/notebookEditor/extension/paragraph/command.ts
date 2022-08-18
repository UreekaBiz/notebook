import { CommandProps } from '@tiptap/core';

import { getBlockNodeRange, getParagraphNodeType, isMarkHolderNode, CommandFunctionType, NodeName } from '@ureeka-notebook/web-service';

// ********************************************************************************
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.PARAGRAPH/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Toggle a paragraph */
      setParagraph: CommandFunctionType<typeof setParagraphCommand, ReturnType>;
    };
  }
}

// --------------------------------------------------------------------------------
// NOTE: this Command has to take into account the following constraints:
//       1. Paragraphs set through this Command should not inherit any marks
//       2. Paragraphs set through this Command should not have MarkHolders,
//          because of 1, but they should (as expected) keep the remaining content
export const setParagraphCommand = () => ({ tr, dispatch, view }: CommandProps) => ((tr, dispatch, view) => {
  const { from, to } = getBlockNodeRange(tr.selection);

  // NOTE: removing MarkHolders before changing NodeType to ensure final
  //       Selection does not change
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if(isMarkHolderNode(node)) {
      tr.delete(pos, pos + node.nodeSize);
    } /* else -- ignore */
  });

  tr.setBlockType(from, to, getParagraphNodeType(view.state.schema))
    .removeMark(from, to, null/*remove all marks*/);

  if(dispatch) dispatch(tr);
  return true/*can be executed*/;
})(tr, dispatch, view);

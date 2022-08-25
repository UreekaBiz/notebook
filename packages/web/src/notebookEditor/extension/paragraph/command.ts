import { getBlockNodeRange, getParagraphNodeType, isMarkHolderNode, Command } from '@ureeka-notebook/web-service';

// ********************************************************************************
// --------------------------------------------------------------------------------
// NOTE: this Command has to take into account the following constraints:
//       1. Paragraphs set through this Command should not inherit any marks
//       2. Paragraphs set through this Command should not have MarkHolders,
//          because of 1, but they should (as expected) keep the remaining content
export const setParagraphCommand: Command = (state, dispatch) => {
  const { tr } = state;
  const { from, to } = getBlockNodeRange(tr.selection);

  // NOTE: removing MarkHolders before changing NodeType to ensure final
  //       Selection does not change
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if(isMarkHolderNode(node)) {
      tr.delete(pos, pos + node.nodeSize);
    } /* else -- ignore */
  });

  tr.setBlockType(from, to, getParagraphNodeType(state.schema))
    .removeMark(from, to, null/*remove all marks*/);

  dispatch(tr);
  return true/*Command executed*/;
};

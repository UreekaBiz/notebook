import { EditorState, Transaction } from 'prosemirror-state';

import { getBlockNodeRange, getParagraphNodeType, isMarkHolderNode, AbstractDocumentUpdate, Command } from '@ureeka-notebook/web-service';

// ********************************************************************************
export const setParagraphCommand: Command = (state, dispatch) => {
  const updatedTr = new SetParagraphDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
// NOTE: this DocumentUpdate has to take into account the following constraints:
//       1. Paragraphs set through this DocumentUpdate should not inherit any marks
//       2. Paragraphs set through this DocumentUpdate should not have MarkHolders,
//          because of 1, but they should (as expected) keep the remaining content
export class SetParagraphDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * modify the given Transaction such that a Paragraph Node is set following
   * the given constraints (SEE: NOTE above) and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { from, to } = getBlockNodeRange(tr.selection);

    // NOTE: removing MarkHolders before changing NodeType to ensure final
    //       Selection does not change
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if(isMarkHolderNode(node)) {
        tr.delete(pos, pos + node.nodeSize);
      } /* else -- ignore */
    });

    tr.setBlockType(from, to, getParagraphNodeType(editorState.schema))
      .removeMark(from, to, null/*remove all marks*/);

    return tr/*updated*/;
  }
}

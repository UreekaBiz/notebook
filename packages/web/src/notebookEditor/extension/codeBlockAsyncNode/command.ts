import { EditorState, NodeSelection, Transaction } from 'prosemirror-state';

import { AbstractDocumentUpdate, CodeBlockAsyncNodeType, Command, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { HISTORY_META } from 'notebookEditor/extension/history/History';

// == Async =======================================================================
// replace an entire inline CodeBlockAsyncNode with another one
export const replaceInlineCodeBlockAsyncNodeCommand = (newAsyncNode: CodeBlockAsyncNodeType, replacementPosition: number): Command => (state, dispatch) => {
  const updatedTr = new ReplaceInlineCodeBlockAsyncNodeDocumentUpdate(newAsyncNode, replacementPosition).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */
  return false/*not executed*/;
};
export class ReplaceInlineCodeBlockAsyncNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly newAsyncNode: CodeBlockAsyncNodeType, private readonly replacementPosition: number) {/*nothing additional*/}

  /**
   * modify the given Transaction such that an entire CodeBlockAsyncNode is
   * replaced with another one and return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
      tr.setSelection(NodeSelection.create(tr.doc, this.replacementPosition))
        .replaceSelectionWith(this.newAsyncNode)
        .setSelection(NodeSelection.create(tr.doc, this.replacementPosition))
        .setMeta(HISTORY_META, false/*once executed, an async node cannot go back to non-executed*/);
    return tr/*updated*/;
  }
}

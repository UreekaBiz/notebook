import { EditorState, Transaction } from 'prosemirror-state';

import { createCodeBlockReferenceNode, generateNodeId, getSelectedNode, isCodeBlockReferenceNode, AbstractDocumentUpdate, CodeBlockReferenceAttributes, Command, NotebookSchemaType, ReplaceAndSelectNodeDocumentUpdate } from '@ureeka-notebook/web-service';

import { focusChipToolInput } from 'notebookEditor/util';

// ================================================================================
/** insert and select a CodeBlockReference */
export const insertAndSelectCodeBlockReferenceCommand: Command = (state, dispatch) => {
  const id = generateNodeId();

  const updatedTr = new InsertAndSelectCodeBlockReferenceDocumentUpdate({ id }).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    focusChipToolInput(id);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class InsertAndSelectCodeBlockReferenceDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly attributes: Partial<CodeBlockReferenceAttributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a CodeBlockReference is inserted
   * and selected, then return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const node = getSelectedNode(editorState);
    if(node && isCodeBlockReferenceNode(node)) return tr/*no updates, ignore if selected Node already is a CodeBlockReference*/;

    const codeBlockReference = createCodeBlockReferenceNode(editorState.schema, { ...this.attributes } );

    const updatedTr = new ReplaceAndSelectNodeDocumentUpdate(codeBlockReference).update(editorState, editorState.tr);
    return updatedTr/*updated*/;
  }
}

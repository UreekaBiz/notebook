import { EditorState, Transaction } from 'prosemirror-state';

import { createDemoAsyncNodeNode, generateNodeId, getSelectedNode, isDemoAsyncNode, AbstractDocumentUpdate, Command, DemoAsyncNodeAttributes, ReplaceAndSelectNodeDocumentUpdate, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { focusChipToolInput } from 'notebookEditor/util';

// ================================================================================
/** insert and select a DemoAsyncNode */
export const insertAndSelectDemoAsyncNodeCommand: Command = (state, dispatch) => {
  const id = generateNodeId();
  const updatedTr = new InsertAndSelectDemoAsyncNodeDocumentUpdate({ id }).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    focusChipToolInput(id);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class InsertAndSelectDemoAsyncNodeDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly attributes: Partial<DemoAsyncNodeAttributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a DemoAsyncNode is inserted
   * and selected, then return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const node = getSelectedNode(editorState);
    if(node && isDemoAsyncNode(node)) return tr/*no updates, ignore if selected Node already is a DemoAsyncNode*/;

    const demoAsyncNode = createDemoAsyncNodeNode(editorState.schema, { ...this.attributes } );

    const updatedTr = new ReplaceAndSelectNodeDocumentUpdate(demoAsyncNode).update(editorState, editorState.tr);
    return updatedTr/*updated*/;
  }
}

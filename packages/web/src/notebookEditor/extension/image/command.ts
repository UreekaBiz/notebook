import { EditorState, Transaction } from 'prosemirror-state';

import { createImageNode, AbstractDocumentUpdate, Command, ImageAttributes, ReplaceAndSelectNodeDocumentUpdate } from '@ureeka-notebook/web-service';

// ================================================================================
// creates and selects an Image Node by replacing whatever is at the current
// selection with the newly created Image Node
export const insertAndSelectImageCommand = (attributes: Partial<ImageAttributes>): Command => (state, dispatch) => {
  const updatedTr = new InsertAndSelectImageDocumentUpdate(attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class InsertAndSelectImageDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly attributes: Partial<ImageAttributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that an Image Node is created and
   * replaces the current Selection, then return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const image = createImageNode(editorState.schema, this.attributes);
    const updatedTr =  new ReplaceAndSelectNodeDocumentUpdate(image).update(editorState, editorState.tr);
    return updatedTr/*updated*/;
  }
}


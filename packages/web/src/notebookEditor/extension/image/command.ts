import { Editor } from '@tiptap/core';
import { EditorState, Transaction } from 'prosemirror-state';

import { createImageNode, isNodeSelection, AbstractDocumentUpdate, AttributeType, Command, ImageAttributes, ReplaceAndSelectNodeDocumentUpdate, VerticalAlign, UpdateAttributesDocumentUpdate, NodeName, SetNodeSelectionDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';

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

// == Util ========================================================================
// sets the vertical alignment Attribute for a Node if it is not currently bottom,
// or sets it to 'bottom' if the desiredAlignment is the same it already has
// NOTE: currently only the Image Node uses this utility
export const setVerticalAlign = (editor: Editor, desiredAlignment: VerticalAlign): boolean => {
  const { selection } = editor.state;
  const nodePos = selection.anchor;
  if(!isNodeSelection(selection)) return false/*do not handle*/;

  const { name: nodeName } = selection.node.type,
        shouldSetBottom = selection.node.attrs[AttributeType.VerticalAlign] === desiredAlignment;

  return applyDocumentUpdates(editor, [
    new UpdateAttributesDocumentUpdate(nodeName as NodeName/*guaranteed by above check*/, { [AttributeType.VerticalAlign]: shouldSetBottom ? VerticalAlign.bottom : desiredAlignment }),
    new SetNodeSelectionDocumentUpdate(nodePos),
  ]);
};

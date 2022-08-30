import { EditorState, Transaction } from 'prosemirror-state';

import { AbstractDocumentUpdate, Command, MarkName, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { ToggleOrSetMarkDocumentUpdate } from '../markHolder/command';

// ********************************************************************************
/** toggle the Underline Mark */
export const toggleUnderlineCommand: Command = (state, dispatch) => {
  const updatedTr = new ToggleUnderlineDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ToggleUnderlineDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * modify the given Transaction such that the Underline Mark
   * is toggled and return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const updatedTr = new ToggleOrSetMarkDocumentUpdate(MarkName.UNDERLINE, editorState.schema.marks[MarkName.UNDERLINE]).update(editorState, tr);
    return updatedTr/*updated*/;
  }
}

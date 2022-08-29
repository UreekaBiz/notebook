import { EditorState, Transaction } from 'prosemirror-state';

import { AbstractDocumentUpdate, Command, MarkName } from '@ureeka-notebook/web-service';

import { ToggleOrSetMarkDocumentUpdate } from '../markHolder/command';

// ********************************************************************************
/** toggle the Underline Mark */
export const toggleUnderlineCommand: Command = (state, dispatch) => {
  const updatedTr = new ToggleUnderlineDocumentUpdate().update(state, state.tr);
  dispatch(updatedTr);
  return true/*command executed*/;
};
export class ToggleUnderlineDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * modify the given Transaction such that the Underline Mark
   * is toggled and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const updatedTr = new ToggleOrSetMarkDocumentUpdate(MarkName.UNDERLINE, editorState.schema.marks[MarkName.UNDERLINE]).update(editorState, tr);
    return updatedTr;
  }
}

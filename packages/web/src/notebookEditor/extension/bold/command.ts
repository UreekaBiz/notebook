import { EditorState, Transaction } from 'prosemirror-state';

import { AbstractDocumentUpdate, Command, MarkName } from '@ureeka-notebook/web-service';

import { ToggleOrSetMarkDocumentUpdate } from '../markHolder/command';

// ********************************************************************************
/** toggle the Bold Mark */
export const toggleBoldCommand: Command = (state, dispatch) => {
  const updatedTr = new ToggleBoldDocumentUpdate().update(state, state.tr);
  dispatch(updatedTr);
  return true/*command executed*/;
};
export class ToggleBoldDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * modify the given Transaction such that the Bold Mark
   * is toggled and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const updatedTr = new ToggleOrSetMarkDocumentUpdate(MarkName.BOLD, editorState.schema.marks[MarkName.BOLD]).update(editorState, tr);
    return updatedTr;
  }
}

import { EditorState, Transaction } from 'prosemirror-state';

import { AbstractDocumentUpdate, Command, MarkName } from '@ureeka-notebook/web-service';

import { ToggleOrSetMarkDocumentUpdate } from '../markHolder/command';

// ********************************************************************************
/** toggle the Strikethrough Mark */
export const toggleStrikethroughCommand: Command = (state, dispatch) => {
  const updatedTr = new ToggleStrikethroughDocumentUpdate().update(state, state.tr);
  dispatch(updatedTr);
  return true/*command executed*/;
};
export class ToggleStrikethroughDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * modify the given Transaction such that the Strikethrough Mark
   * is toggled and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const updatedTr = new ToggleOrSetMarkDocumentUpdate(MarkName.STRIKETHROUGH, editorState.schema.marks[MarkName.STRIKETHROUGH]).update(editorState, tr);
    return updatedTr;
  }
}

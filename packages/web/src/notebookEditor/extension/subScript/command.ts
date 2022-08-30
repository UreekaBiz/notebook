import { EditorState, Transaction } from 'prosemirror-state';

import { AbstractDocumentUpdate, Command, MarkName, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { ToggleOrSetMarkDocumentUpdate } from '../markHolder/command';

// ********************************************************************************
/** toggle the SubScript Mark */
export const toggleSubScriptCommand: Command = (state, dispatch) => {
  const updatedTr = new ToggleSubScriptDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class ToggleSubScriptDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /**
   * modify the given Transaction such that the SubScript Mark
   * is toggled and return it
   */
  public update(editorState: EditorState<NotebookSchemaType>, tr: Transaction<NotebookSchemaType>) {
    const updatedTr = new ToggleOrSetMarkDocumentUpdate(MarkName.SUB_SCRIPT, editorState.schema.marks[MarkName.SUB_SCRIPT]).update(editorState, tr);
    return updatedTr/*updated*/;
  }
}

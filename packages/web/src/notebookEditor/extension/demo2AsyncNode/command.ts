import { EditorState, Transaction } from 'prosemirror-state';

import { createReplacedTextMarkMark, AbstractDocumentUpdate, Command, HISTORY_META } from '@ureeka-notebook/web-service';

// ********************************************************************************
/**
 * replaces the Text to replace inside the D2AN and wraps it in
 * the ReplacedTextMark
 * @param d2ANPos the global position of the D2AN in the Document
 * @param textContent the TextContent fo the D2AN
 * @param textToReplace the Text that will be replaced
 * @param result the result that will be used to replace the textToReplace
 * @returns
 */
export const asyncReplaceDemo2AsyncNodeContentCommand = (d2ANPos: number, textContent: string, textToReplace: string, result: string): Command => (state, dispatch) => {
  const updatedTr = new AsyncReplaceDemo2AsyncNodeContentDocumentUpdate(d2ANPos, textContent, textToReplace, result).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class AsyncReplaceDemo2AsyncNodeContentDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly d2ANPos: number, private readonly textContent: string, private readonly textToReplace: string, private readonly result: string) {/*nothing additional*/}

  /**
   * modify the given Transaction such that the Text to replace inside the D2AN
   * is deleted and wrapped in the ReplacedTextMark
   */
  public update(editorState: EditorState, tr: Transaction) {
    // Text is no longer present in the document
    if(!this.textContent.includes(this.textToReplace)) return false/*nothing to do -- view not updated*/;

    // get the position of the highlighted Text and create a mark that will wrap it
    const replacementStart = this.d2ANPos + this.textContent.indexOf(this.textToReplace) + 1/*account for start of Node*/,
          replacementEnd = replacementStart + this.textToReplace.length,
          markFrom = replacementStart,
          markTo = markFrom + this.result.length;

    const replaceTextMark = createReplacedTextMarkMark(editorState.schema);

    tr.insertText(this.result, replacementStart, replacementEnd)
      .addMark(markFrom, markTo, replaceTextMark)
      .setMeta(HISTORY_META, false/*do not include in the history*/);

    return tr/*updated*/;
  }
}

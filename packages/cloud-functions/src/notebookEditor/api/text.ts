import { EditorState } from 'prosemirror-state';

import { DocumentUpdate } from './type';

// ********************************************************************************
/** Inserts the specified text in the specified (optional) range
 *  @see Transaction#insertText() */
export class InsertText implements DocumentUpdate {
  public constructor(public readonly text: string, public readonly from?: number, public readonly to?: number) {/*nothing additional*/}

  // == DocumentUpdate ============================================================
  public update(document: EditorState) {
    return document.tr.insertText(this.text, this.from, this.to);
  }
}

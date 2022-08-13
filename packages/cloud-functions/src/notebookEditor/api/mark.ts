import { EditorState, Transaction } from 'prosemirror-state';

import { createMark, MarkName } from '@ureeka-notebook/service-common';

import { ApplicationError } from '../../util/error';
import { DocumentUpdate } from './type';

// ********************************************************************************
/** add the specified mark in the specified range
 *  @see Transaction#insertText() */
export class AddMark implements DocumentUpdate {
  public constructor(private readonly markName: MarkName, private readonly from: number, private readonly to: number) {/*nothing additional*/}
  public update(editorState: EditorState, tr: Transaction ) {
    const mark = createMark(this.markName, editorState.schema);
    if(!mark) throw new ApplicationError('functions/invalid-argument', `Mark (${this.markName}) is not a valid mark.`);

    tr.addMark(this.from, this.to, mark);
  }
}

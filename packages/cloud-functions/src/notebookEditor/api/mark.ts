import { EditorState, Transaction } from 'prosemirror-state';

import { getMark, MarkName } from '@ureeka-notebook/service-common';

import { DocumentUpdate } from './type';
import { ApplicationError } from '../../util/error';

// ********************************************************************************
/** add the specified mark in the specified range
 *  @see Transaction#insertText() */
export class AddMark implements DocumentUpdate {
  public constructor(private readonly markName: MarkName, private readonly from: number, private readonly to: number) {/*nothing additional*/}
  public update(editorState: EditorState, tr: Transaction ) {
    const mark = getMark(editorState.schema, this.markName);
    if(!mark) throw new ApplicationError('functions/invalid-argument', `Mark (${this.markName}) is not a valid mark.`);

    tr.addMark(this.from, this.to, mark);
  }
}

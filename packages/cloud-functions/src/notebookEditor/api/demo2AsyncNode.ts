import { EditorState, Transaction } from 'prosemirror-state';

import { createReplacedTextMarkMark, findNodeById, isDemo2AsyncNode, AsyncNodeStatus, AttributeType, DemoAsyncNodeAttributes, NodeIdentifier } from '@ureeka-notebook/service-common';

import { ApplicationError } from '../../util/error';
import { DocumentUpdate } from './type';

// ********************************************************************************
/** Updates the identified Demo2AsyncNode with the specified status and text */
export class Demo2AsyncNodeAttributeReplace implements DocumentUpdate {
  public constructor(
    private readonly nodeId: NodeIdentifier,
    private readonly status: AsyncNodeStatus,
    private readonly text: string | undefined/*invalid*/,
    // the position of the ReplacedTextMark relative to the given text.
    private readonly markStart: number | undefined/*no mark*/,
    private readonly markEnd: number | undefined/*no mark*/
  ) {/*nothing additional*/}

  // == DocumentUpdate ============================================================
  public update(editorState: EditorState, tr: Transaction ) {
    // get the Demo 2 Async Node for the Node Identifier
    const result = findNodeById(editorState, this.nodeId);
    if(!result) throw new ApplicationError('functions/not-found', `Cannot Replace Attributes in non-existing Demo 2 Async Node (${this.nodeId}).`);
    const { node, position } = result;
    if(!isDemo2AsyncNode(node)) throw new ApplicationError('functions/invalid-argument', `Node (${this.nodeId}) is not a Demo 2 Async Node.`);

    const attrs: Partial<DemoAsyncNodeAttributes> = { ...node.attrs, [AttributeType.Status]: this.status };

    const start = position + 1/*account for start of node*/,
          end = position + 1/*account for start of node*/ + node.content.size;

    const mark = createReplacedTextMarkMark(editorState.schema);
    if(!mark) throw new ApplicationError('devel/config', `Node (${this.nodeId}) is not a Demo 2 Async Node.`);

    // update the attributes of the Node and inserts the text at the given position
    // with the corresponding mark
    tr.setNodeMarkup(position, undefined/*preserve type*/, attrs)
      .insertText((this.status === AsyncNodeStatus.SUCCESS) ? this.text ?? '' : 'Error'/*CHECK: what else?*/, start, end);

    if(this.markStart !== undefined && this.markEnd !== undefined) {
      tr.addMark(start + this.markStart, start + this.markStart + this.markEnd, mark);
    } // else -- no mark range was provided
  }
}

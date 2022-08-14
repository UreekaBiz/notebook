import { EditorState, Transaction } from 'prosemirror-state';

import { findNodeById, isDemo2AsyncNode, AsyncNodeStatus, AttributeType, Demo2AsyncNodeType, NodeIdentifier } from '@ureeka-notebook/service-common';

import { ApplicationError } from '../../util/error';
import { DocumentUpdate } from './type';

// ********************************************************************************
/** Updates the identified Demo2AsyncNode with the specified status and text */
export class Demo2AsyncNodeAttributeReplace implements DocumentUpdate {
  public constructor(private readonly nodeId: NodeIdentifier, private readonly status: AsyncNodeStatus) {/*nothing additional*/}

  // == DocumentUpdate ============================================================
  public update(editorState: EditorState, tr: Transaction ) {
    // get the Demo 2 Async Node for the Node Identifier
    const result = findNodeById(editorState.doc, this.nodeId);
    if(!result) throw new ApplicationError('functions/not-found', `Cannot Replace Attributes in non-existing Demo 2 Async Node (${this.nodeId}).`);
    const { node, position } = result;
    if(!isDemo2AsyncNode(node)) throw new ApplicationError('functions/invalid-argument', `Node (${this.nodeId}) is not a Demo 2 Async Node.`);

    const newNode = node.copy(node.content) as Demo2AsyncNodeType/*guaranteed by above check*/;
          newNode.attrs[AttributeType.Status] = this.status;

    tr.replaceWith(position, position + node.nodeSize, newNode);
  }
}

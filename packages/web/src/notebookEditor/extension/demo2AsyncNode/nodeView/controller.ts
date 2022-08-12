import { Editor } from '@tiptap/core';

import { getPosType, Demo2AsyncNodeType } from '@ureeka-notebook/web-service';

import { AbstractAsyncNodeController } from 'notebookEditor/extension/asyncNode/nodeView/controller';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { Demo2AsyncNodeModel } from './model';
import { Demo2AsyncNodeView } from './view';

// ********************************************************************************
export type Demo2AsyncNodeStorageType = NodeViewStorage<Demo2AsyncNodeController>;
export class Demo2AsyncNodeController extends AbstractAsyncNodeController<string, Demo2AsyncNodeType, Demo2AsyncNodeStorageType, Demo2AsyncNodeModel, Demo2AsyncNodeView> {
  // == Life-cycle ================================================================
  public constructor(editor: Editor, node: Demo2AsyncNodeType, storage: Demo2AsyncNodeStorageType, getPos: getPosType) {
    const model = new Demo2AsyncNodeModel(editor, node, storage, getPos),
          view = new Demo2AsyncNodeView(model, editor, node, storage, getPos);
    super(model, view, editor, node, storage, getPos);
  }

  // .. Mutation ..................................................................
  /**
   * Ignore Mutation that modify the ChildList of the Nodes within this view.
   * This happens when explicitly modifying HTML of the view. Returning true
   * prevents the Selection from being re-read around the Mutation.
   * @see NodeView#ignoreMutation()
   */
   public ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element; }) {
    // Ignore if the attributes changed
    return  mutation.type === 'attributes';
  }
}

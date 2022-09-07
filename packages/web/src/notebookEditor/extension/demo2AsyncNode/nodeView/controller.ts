import { Editor } from '@tiptap/core';

import { getPosType, ApplicationError, AttributeType, Demo2AsyncNodeType, NotebookEditorService, NotebookIdentifier } from '@ureeka-notebook/web-service';

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

  // == Execution =================================================================
  public async executeRemote(notebookId: NotebookIdentifier, editorService: NotebookEditorService): Promise<void>{
    if(this.nodeModel.getPerformingAsyncOperation()) return/*nothing to do*/;

    const { attrs } = this.node as Demo2AsyncNodeType;
    const id = attrs[AttributeType.Id];
    if(!id) return/*nothing to render -- silently fail*/;
    const content = this.node.textContent,
          replace = attrs[AttributeType.TextToReplace];

    if(!replace) throw new ApplicationError('functions/invalid-argument', 'Missing textToReplace');

    this.nodeModel.setPerformingAsyncOperation(true);
    this.nodeView.updateView();

    // NOTE: This is needed to update the React components and reflect the status
    //       of the async operation. Changing the selection to the current
    //       selection doesn't do any change besides updating the React components.
    const { state, view } = this.editor;
    const { tr, selection } = state;
    tr.setSelection(selection);
    view.dispatch(tr);
    try {
      await editorService.executeDemo2AsyncNode({ nodeId: id, notebookId, content, replace });
    } catch(error) {
      throw error/*rethrow*/;
    } finally {
      this.nodeModel.setPerformingAsyncOperation(false);
      this.nodeView.updateView();
    }
    return;
  }

  // .. Mutation ..................................................................
  /**
   * Ignore Mutation that modify the ChildList of the Nodes within this view.
   * This happens when explicitly modifying HTML of the view. Returning true
   * prevents the Selection from being re-read around the Mutation.
   * @see NodeView#ignoreMutation()
   */
   public ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element; }) {
    // ignore if modifying the ChildList, Attributes of the Nodes within this View
    return (mutation.type === 'childList') || (mutation.type === 'attributes');
  }
}

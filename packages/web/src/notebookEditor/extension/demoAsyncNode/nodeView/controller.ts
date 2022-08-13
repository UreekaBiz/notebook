import { Editor } from '@tiptap/core';

import { getPosType, AttributeType, DemoAsyncNodeType, NotebookEditorService, NotebookIdentifier } from '@ureeka-notebook/web-service';

import { AbstractCodeBlockAsyncNodeController } from 'notebookEditor/extension/codeBlockAsyncNode/nodeView/controller';
import { getCodeBlocksContent, hashesFromCodeBlockReferences } from 'notebookEditor/extension/codeBlockAsyncNode/util';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { DemoAsyncNodeModel } from './model';
import { DemoAsyncNodeView } from './view';

// ********************************************************************************
export type DemoAsyncNodeStorageType = NodeViewStorage<DemoAsyncNodeController>
export class DemoAsyncNodeController extends AbstractCodeBlockAsyncNodeController<string, DemoAsyncNodeType, DemoAsyncNodeStorageType, DemoAsyncNodeModel, DemoAsyncNodeView> {
  // == Life-cycle ================================================================
  public constructor(editor: Editor, node: DemoAsyncNodeType, storage: DemoAsyncNodeStorageType, getPos: getPosType) {
    const model = new DemoAsyncNodeModel(editor, node, storage, getPos),
          view = new DemoAsyncNodeView(model, editor, node, storage, getPos);

    super(model, view, editor, node, storage, getPos);
  }

  // == Execution =================================================================
  public async executeRemote(notebookId: NotebookIdentifier, editorService: NotebookEditorService): Promise<void>{
    if(this.nodeModel.getPerformingAsyncOperation()) return/*nothing to do*/;

    const { attrs } = this.node as DemoAsyncNodeType;
    const id = attrs[AttributeType.Id];
    if(!id) return/*nothing to render -- silently fail*/;
    const codeBlockReferences = attrs[AttributeType.CodeBlockReferences] ?? []/*default*/;

    this.nodeModel.setPerformingAsyncOperation(true);
    this.nodeView.updateView();
    try {
      const content = getCodeBlocksContent(this.editor, codeBlockReferences),
            hashes = hashesFromCodeBlockReferences(this.editor, codeBlockReferences);
      await editorService.executeDemoAsyncNode({ content, hashes, nodeId: id, notebookId });
    } catch(error){
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
    // ignore if modifying the ChildList of the Nodes within this View
    return (mutation.type === 'childList') || (mutation.type === 'attributes');
  }
}

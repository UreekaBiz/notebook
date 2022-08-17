import { Editor } from '@tiptap/core';

import { getPosType, CodeBlockReferenceNodeType } from '@ureeka-notebook/web-service';

import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';
import { focusCodeBlock } from 'notebookEditor/extension/codeblock/util';
import { AbstractNodeController } from 'notebookEditor/model/AbstractNodeController';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { CodeBlockReferenceModel } from './model';
import { CodeBlockReferenceView } from './view';

// ********************************************************************************
export type CodeBlockReferenceStorageType = NodeViewStorage<CodeBlockReferenceController>;
export class CodeBlockReferenceController extends AbstractNodeController<CodeBlockReferenceNodeType, CodeBlockReferenceStorageType, CodeBlockReferenceModel, CodeBlockReferenceView> {
  // == Life-cycle ================================================================
  public constructor(editor: Editor, node: CodeBlockReferenceNodeType, storage: CodeBlockReferenceStorageType, getPos: getPosType) {
    const model = new CodeBlockReferenceModel(editor, node, storage, getPos),
          view = new CodeBlockReferenceView(model, editor, node, storage, getPos);

    super(model, view, editor, node, storage, getPos);
    // CHECK: Should this be at this level? Or should it be in the view?
    this.addEventListenerToView();
  }

  public destroy() {
    this.nodeView.viewElement.removeEventListener('mousedown', this.handleViewElementMouseDown);
  }

  // -- Event ---------------------------------------------------------------------
  private addEventListenerToView() {
    this.nodeView.viewElement.addEventListener('mousedown', this.handleViewElementMouseDown.bind(this/*maintain reference to same scope*/));
  }

  private handleViewElementMouseDown(event: MouseEvent) {
    if(!(event.metaKey || event.ctrlKey)) return/*do not focus referenced CodeBlock if Cmd/Ctrl not pressed*/;

    const { codeBlockReference } = this.node.attrs;
    if(!codeBlockReference) return/*nothing to do*/;

    event.preventDefault()/*do not trigger PM NodeSelection*/;
    const codeBlockViewStorage = getCodeBlockViewStorage(this.editor);
    const codeBlockVisualId = codeBlockViewStorage.getVisualId(codeBlockReference);
    focusCodeBlock(this.editor, codeBlockVisualId);
  }
}

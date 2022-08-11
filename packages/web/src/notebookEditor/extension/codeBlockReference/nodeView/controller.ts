import { Editor } from '@tiptap/core';

import { CodeBlockReferenceNodeType } from '@ureeka-notebook/web-service';

import { getCodeBlockViewStorage } from 'notebookEditor/extension/codeblock/nodeView/storage';
import { focusCodeBlock } from 'notebookEditor/extension/codeblock/util';
import { getPosType } from 'notebookEditor/extension/util/node';
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

  // called by ProseMirror when the node is removed
  protected destroy() {
    this.nodeView.viewElement.removeEventListener('click', this.handleViewElementClick);
  }

  // -- Event ---------------------------------------------------------------------
  private addEventListenerToView() {
    this.nodeView.viewElement.addEventListener('click', this.handleViewElementClick.bind(this/*maintain reference to same scope*/));
  }

  private handleViewElementClick(event: MouseEvent) {
    if(!(event.metaKey || event.ctrlKey)) return/*do not focus referenced CodeBlock if Cmd/Ctrl not pressed*/;

    const { codeBlockReference } = this.node.attrs;
    if(!codeBlockReference) return/*nothing to do*/;

    const codeBlockViewStorage = getCodeBlockViewStorage(this.editor);
    const codeBlockVisualId = codeBlockViewStorage.getVisualId(codeBlockReference);
    focusCodeBlock(this.editor, codeBlockVisualId);
  }
}

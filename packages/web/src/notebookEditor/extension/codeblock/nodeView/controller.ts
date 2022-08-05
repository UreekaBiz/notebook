import { Editor } from '@tiptap/core';

import { CodeBlockNodeType } from '@ureeka-notebook/web-service';

import { getPosType } from 'notebookEditor/extension/util/node';
import { AbstractNodeController } from 'notebookEditor/model/AbstractNodeController';

import { CodeBlockModel } from './model';
import { CodeBlockStorage } from './storage';
import { CodeBlockView } from './view';

// ********************************************************************************
export class CodeBlockController extends AbstractNodeController<CodeBlockNodeType, CodeBlockStorage, CodeBlockModel, CodeBlockView> {
  // == Lifecycle =================================================================
  public constructor(editor: Editor, node: CodeBlockNodeType, codeBlockStorage: CodeBlockStorage, getPos: getPosType) {
    const model = new CodeBlockModel(editor, node, codeBlockStorage, getPos),
          view = new CodeBlockView(model, editor, node, codeBlockStorage, getPos);

    super(model, view, editor, node, codeBlockStorage, getPos);
  }

  // .. Mutation ..................................................................
  /**
   * Ignore Mutation that modify the ChildList of the Nodes within this view.
   * This happens when explicitly modifying HTML of the view. Returning true
   * prevents the Selection from being re-read around the Mutation.
   * @see NodeView#ignoreMutation()
   * @see #updateVisualID()
   */
  public ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element; }) {
    // ignore if modifying the ChildList of the Nodes within this View
    return (mutation.type === 'childList') || (mutation.type === 'attributes');
  }
}

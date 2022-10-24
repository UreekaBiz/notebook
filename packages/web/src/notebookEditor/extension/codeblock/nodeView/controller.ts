import { Editor } from '@tiptap/core';

import { getPosType, CodeBlockNodeType } from '@ureeka-notebook/web-service';

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
    if((mutation.type === 'childList') || (mutation.type === 'attributes')) {
      return true/*ignore mutation*/;
    } /* else -- check mutation target*/

    // REF: https://discuss.prosemirror.net/t/what-can-cause-a-nodeview-to-be-rebuilt/4959
    // NOTE: this specifically addresses the CodeBlocks disappearing after destroy()
    //       gets called when the DOM mutation happens inside the DOM when adding
    //       or removing Headings, which change the VisualId of the CodeBlock and
    //       hence trigger the mutation. This is needed after the NodeViewRemoval logic
    //       has been delegated to ProseMirror (SEE: AbstractNodeController#destroy).
    //       Currently this logic is exclusive to CodeBlocks since their VisualId gets
    //       updated dynamically
    if(this.nodeView.dom?.contains(mutation.target)) {
      return true/*ignore mutation*/;
    } /* else -- return default */

    return false/*do not ignore */;
  }
}

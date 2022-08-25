import { Editor } from '@tiptap/core';

import { getPosType, Demo2AsyncNodeType } from '@ureeka-notebook/web-service';

import { AbstractAsyncNodeView } from 'notebookEditor/extension/asyncNode/nodeView/view';
import { WrapReactNodeView } from 'notebookEditor/model/ReactNodeView';

import { Demo2AsyncNodeStorageType } from './controller';
import { Demo2AsyncNodeComponent, Demo2AsyncNodeComponentProps } from './jsx';
import { Demo2AsyncNodeModel } from './model';

// ********************************************************************************
export class Demo2AsyncNodeView extends AbstractAsyncNodeView<string, Demo2AsyncNodeType, Demo2AsyncNodeStorageType, Demo2AsyncNodeModel> {
  // The div where the text content of the demo2AsyncNodeView is rendered
  readonly contentDOM: HTMLElement;

  // == Lifecycle =================================================================
  public constructor(model: Demo2AsyncNodeModel, editor: Editor, node: Demo2AsyncNodeType, codeBlockStorage: Demo2AsyncNodeStorageType, getPos: getPosType) {
    super(model, editor, node, codeBlockStorage, getPos);

    // .. UI ......................................................................
    // Create DOM elements and append it to the outer container (dom).
    const contentDOM = document.createElement('div');
    this.contentDOM = contentDOM;

    this.reactNodeView = (props) => WrapReactNodeView(
      this.contentDOM,
      props,
      // FIXME: Types!
      (props) => <Demo2AsyncNodeComponent {...props as unknown as Demo2AsyncNodeComponentProps} />,
      {/*no options*/}
    );

    // Sync view with current state
    this.updateView();
  }

  // /** @see AbstractNodeView#createDomElement() */
  protected createDomElement() { return document.createElement('div'); }

  public updateView(): void {
    // check model
    const performingAsyncOperation = this.model.getPerformingAsyncOperation();

    // disable/enable the view if the model is performing an async operation
    // NOTE: while the Demo2AsyncNode is performing an async operation an
    //       onTransaction handler (SEE: AsyncNode.ts) prevents any transactions
    //       that modify the content of the Demo2AsyncNode from being applied
    this.contentDOM.setAttribute('contenteditable', performingAsyncOperation ? 'false' : 'true');

    // NOTE: ProseMirror adds white-space: normal to non editable nodes, this causes
    //       the node to lose its white-space while its being executed. The solution
    //       is to overwrite that property on this specific case. */
    this.contentDOM.style.whiteSpace = 'pre-wrap';

    // call super method to update the ReactNodeView
    super.updateView();
  }

}

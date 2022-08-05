import { Editor } from '@tiptap/core';

import { getRenderAttributes, Demo2AsyncNodeRendererSpec, Demo2AsyncNodeSpec, Demo2AsyncNodeType, NodeName } from '@ureeka-notebook/web-service';

import { AbstractAsyncNodeView } from 'notebookEditor/extension/asyncNode/nodeView/view';
import { getPosType } from 'notebookEditor/extension/util/node';

import { Demo2AsyncNodeStorageType } from './controller';
import { Demo2AsyncNodeModel } from './model';

// ********************************************************************************
export class Demo2AsyncNodeView extends AbstractAsyncNodeView<string, Demo2AsyncNodeType, Demo2AsyncNodeStorageType, Demo2AsyncNodeModel> {
  // The paragraph where the text content of the demo2AsyncNodeView is rendered
  readonly contentDOM: HTMLElement;

  // The div that holds the paragraph holding the content of the Demo2AsyncNodeView.
  // This is present since specific styles must be applied to the outer div
  // (this.dom), and the inner div (innerContainer). Other NodeViews may specify
  // as much local elements as their view requires them to.
  private innerContainer: HTMLDivElement;

  // == Lifecycle =================================================================
  public constructor(model: Demo2AsyncNodeModel, editor: Editor, node: Demo2AsyncNodeType, codeBlockStorage: Demo2AsyncNodeStorageType, getPos: getPosType) {
    super(model, editor, node, codeBlockStorage, getPos);

    // .. UI ......................................................................
    // Create DOM elements and append it to the outer container (dom).
    const innerContainer = document.createElement('div');
    this.innerContainer = innerContainer;
    this.innerContainer.appendChild(this.content);

    this.dom.appendChild(this.innerContainer);

    // .. ProseMirror .............................................................
    // Tell PM that the content fo the node must go into the paragraph element,
    // by delegating keeping track of the it to PM (SEE: NodeView#contentDOM)
    this.contentDOM = this.content/*created by createViewElement call*/;

    // Sync view with current state
    this.updateView();
  }

  // -- Creation ------------------------------------------------------------------
  // creates the DOM element that will be used to contain the node
  protected createDomElement(): HTMLElement {
    const outerContainer = document.createElement('div');

    return outerContainer;
  }

  // creates the DOM element that will be used to display the node's content
  protected createViewElement(node: Demo2AsyncNodeType): HTMLElement {
    const content = document.createElement('div');

    return content;
  }

  // -- Update --------------------------------------------------------------------
  public updateView() {
    const { attrs } = this.node;

    // Update styles
    const renderAttributes = getRenderAttributes(NodeName.DEMO_2_ASYNC_NODE, attrs, Demo2AsyncNodeRendererSpec, Demo2AsyncNodeSpec);
    this.dom.setAttribute('style', renderAttributes.style ?? ''/*empty string if not present*/);

    // check model
    const performingAsyncOperation = this.model.getPerformingAsyncOperation();

    // disable/enable the view if the model is performing an async operation
    // NOTE: while the Demo2AsyncNode is performing an async operation an
    //       onTransaction handler (SEE: AsyncNode.ts) prevents any transactions
    //       that modify the content of the Demo2AsyncNode from being applied
    this.content.setAttribute('contenteditable', performingAsyncOperation ? 'false' : 'true');

    if(performingAsyncOperation){
      this.dom.classList.add('performing-async-operation');
    } else {
      this.dom.classList.remove('performing-async-operation');
    }

    // call super updateView method.
    super.updateView();
  }
}

import { Editor } from '@tiptap/core';
import { asyncNodeStatusToColor, getPosType, getRenderAttributes, AsyncNodeStatus, AttributeType, DemoAsyncNodeRendererSpec, DemoAsyncNodeSpec, DemoAsyncNodeType, NodeName, DEMO_ASYNC_NODE_STATUS_COLOR, DEMO_ASYNC_NODE_DATA_STATE, DEFAULT_DEMO_ASYNC_NODE_TEXT } from '@ureeka-notebook/web-service';

import { AbstractCodeBlockAsyncNodeView } from 'notebookEditor/extension/codeBlockAsyncNode/nodeView/view';
import { createTooltip, updateTooltip } from 'notebookEditor/extension/util/tooltip';
import { createTextSpan } from 'notebookEditor/extension/util/ui';

import { DemoAsyncNodeStorageType } from './controller';
import { DemoAsyncNodeModel } from './model';

// ********************************************************************************
export class DemoAsyncNodeView extends AbstractCodeBlockAsyncNodeView<string, DemoAsyncNodeType, DemoAsyncNodeStorageType, DemoAsyncNodeModel> {
  /** a tooltip that displays content when hovering into the node */
  private tooltip: HTMLElement;

  constructor(model: DemoAsyncNodeModel, editor: Editor, node: DemoAsyncNodeType, asyncNodeStorage: DemoAsyncNodeStorageType, getPos: getPosType) {
    super(model, editor, node, asyncNodeStorage, getPos);

    this.tooltip = createTooltip();
    this.dom.appendChild(this.tooltip);
    this.updateView();
  }

  // -- Creation ------------------------------------------------------------------
  // Creates the DOM element that will be used to display the node's content.
  protected createViewElement(node: DemoAsyncNodeType): HTMLElement {
    const text = node.attrs.text ?? DEFAULT_DEMO_ASYNC_NODE_TEXT/*default*/;

    return createTextSpan(node, text);
  }

  // -- Update --------------------------------------------------------------------
  public updateView() {
    const { attrs } = this.node;
    const performingAsyncOperation = this.model.getPerformingAsyncOperation();
    const status = attrs[AttributeType.Status] ?? AsyncNodeStatus.NEVER_EXECUTED/*default value*/;

    // Update styles
    const statusColor = performingAsyncOperation ? asyncNodeStatusToColor(AsyncNodeStatus.PROCESSING) : asyncNodeStatusToColor(status);
    const renderAttributes = getRenderAttributes(NodeName.DEMO_ASYNC_NODE, attrs, DemoAsyncNodeRendererSpec, DemoAsyncNodeSpec);
    const style = `${renderAttributes.style ?? ''/*empty string if not present*/} ${DEMO_ASYNC_NODE_STATUS_COLOR}: ${statusColor};`;
    this.content.setAttribute('style', style);

    this.content.setAttribute(DEMO_ASYNC_NODE_DATA_STATE, ''/*does not need a value*/);

    if(this.content.innerText !== attrs.text) this.content.innerText = attrs.text;
    /* else -- current view matches state */

    // updates tooltip
    updateTooltip(this.tooltip, status);

    // Call super updateView method.
    super.updateView();
  }
}

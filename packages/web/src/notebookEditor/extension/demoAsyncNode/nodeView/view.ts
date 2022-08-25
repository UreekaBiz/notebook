import { Editor } from '@tiptap/core';
import { asyncNodeStatusToColor, getPosType, getRenderAttributes, AsyncNodeStatus, AttributeType, DemoAsyncNodeRendererSpec, DemoAsyncNodeSpec, DemoAsyncNodeType, NodeName, DEMO_ASYNC_NODE_STATUS_COLOR, DEMO_ASYNC_NODE_DATA_STATE, DEFAULT_DEMO_ASYNC_NODE_TEXT } from '@ureeka-notebook/web-service';

import { AbstractCodeBlockAsyncNodeView } from 'notebookEditor/extension/codeBlockAsyncNode/nodeView/view';
import { createTooltip, updateTooltip } from 'notebookEditor/extension/util/tooltip';
import { createTextSpan } from 'notebookEditor/extension/util/ui';

import { DemoAsyncNodeStorageType } from './controller';
import { DemoAsyncNodeModel } from './model';

// ********************************************************************************
export class DemoAsyncNodeView extends AbstractCodeBlockAsyncNodeView<string, DemoAsyncNodeType, DemoAsyncNodeStorageType, DemoAsyncNodeModel> {
  // The div where the text content of the demo2AsyncNodeView is rendered
  readonly contentDOM: HTMLElement;

  /** a tooltip that displays content when hovering into the node */
  private tooltip: HTMLElement;

  constructor(model: DemoAsyncNodeModel, editor: Editor, node: DemoAsyncNodeType, asyncNodeStorage: DemoAsyncNodeStorageType, getPos: getPosType) {
    super(model, editor, node, asyncNodeStorage, getPos);

    // creates contentDOM
    const text = node.attrs.text ?? DEFAULT_DEMO_ASYNC_NODE_TEXT/*default*/;

    this.contentDOM = createTextSpan(node, text);
    this.dom.appendChild(this.contentDOM);

    // create tooltip
    this.tooltip = createTooltip();
    this.dom.appendChild(this.tooltip);
    this.updateView();
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
    this.contentDOM.setAttribute('style', style);

    this.contentDOM.setAttribute(DEMO_ASYNC_NODE_DATA_STATE, ''/*does not need a value*/);

    if(this.contentDOM.innerText !== attrs.text) this.contentDOM.innerText = attrs.text;
    /* else -- current view matches state */

    // updates tooltip
    updateTooltip(this.tooltip, status);

    // Call super updateView method.
    super.updateView();
  }
}

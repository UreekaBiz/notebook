import { asyncNodeStatusToColor, getRenderAttributes, AsyncNodeStatus, AttributeType, DemoAsyncNodeRendererSpec, DemoAsyncNodeSpec, DemoAsyncNodeType, NodeName, DEMO_ASYNCNODE_TEXT_STYLE, DEMO_ASYNCNODE_STATUS_COLOR, DEMO_ASYNCNODE_BORDER_COLOR, DEMO_ASYNCNODE_DATA_STATE } from '@ureeka-notebook/web-service';

import { AbstractCodeBlockAsyncNodeView } from 'notebookEditor/extension/codeBlockAsyncNode/nodeView/view';
import { createTextSpan } from 'notebookEditor/extension/codeBlockAsyncNode/ui';

import { DemoAsyncNodeStorageType } from './controller';
import { DemoAsyncNodeModel } from './model';

// ********************************************************************************
export class DemoAsyncNodeView extends AbstractCodeBlockAsyncNodeView<string, DemoAsyncNodeType, DemoAsyncNodeStorageType, DemoAsyncNodeModel> {
  // -- Creation ------------------------------------------------------------------
  // Creates the DOM element that will be used to display the node's content.
  protected createViewElement(node: DemoAsyncNodeType): HTMLElement {
    return createTextSpan(node);
  }

  // -- Update --------------------------------------------------------------------
  public updateView() {
    const { attrs } = this.node;
    const performingAsyncOperation = this.model.getPerformingAsyncOperation();
    const status = attrs[AttributeType.Status] ?? AsyncNodeStatus.NEVER_EXECUTED/*default value*/;

    // Update styles
    const statusColor = performingAsyncOperation ? asyncNodeStatusToColor(AsyncNodeStatus.PROCESSING) : asyncNodeStatusToColor(status);
    const renderAttributes = getRenderAttributes(NodeName.DEMO_ASYNCNODE, attrs, DemoAsyncNodeRendererSpec, DemoAsyncNodeSpec);
    const style = `${renderAttributes.style ?? ''/*empty string if not present*/} ${DEMO_ASYNCNODE_TEXT_STYLE} ${DEMO_ASYNCNODE_STATUS_COLOR}: ${statusColor}; ${DEMO_ASYNCNODE_BORDER_COLOR};`;
    this.content.setAttribute('style', style);

    this.content.setAttribute(DEMO_ASYNCNODE_DATA_STATE, ''/*does not need a value*/);

    if(this.content.innerHTML !== attrs.text) this.content.innerHTML = attrs.text;
    /* else -- current view matches state */

    // Call super updateView method.
    super.updateView();
  }
}

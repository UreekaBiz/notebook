import { CodeBlockAsyncNodeType } from '@ureeka-notebook/web-service';

import { AbstractAsyncNodeView } from 'notebookEditor/extension/asyncNode/nodeView/view';
import { createInlineNodeContainer } from 'notebookEditor/extension/inlineNodeWithContent/util';

import { AbstractCodeBlockAsyncNodeStorageType } from './controller';
import { AbstractCodeBlockAsyncNodeModel } from './model';

// ********************************************************************************
export abstract class AbstractCodeBlockAsyncNodeView<
  T/*value returned by the async function*/,
  NodeType extends CodeBlockAsyncNodeType,
  Storage extends AbstractCodeBlockAsyncNodeStorageType,
  NodeModel extends AbstractCodeBlockAsyncNodeModel<T, NodeType, Storage>
  > extends AbstractAsyncNodeView<T, NodeType, Storage, NodeModel> {

  // == View ======================================================================
  // creates the DOM element that will be used to display the node's content
  protected createDomElement(): HTMLElement {
    // AbstractCodeBlockAsyncNodeViews are *currently* all inline
    return createInlineNodeContainer();
  }
}

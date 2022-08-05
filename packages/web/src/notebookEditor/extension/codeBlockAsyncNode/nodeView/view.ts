import { Editor } from '@tiptap/core';

import { CodeBlockAsyncNodeType } from '@ureeka-notebook/web-service';

import { AbstractAsyncNodeView } from 'notebookEditor/extension/asyncNode/nodeView/view';
import { getPosType } from 'notebookEditor/extension/util/node';
import { createInlineNodeContainer } from 'notebookEditor/extension/util/ui';

import { AbstractCodeBlockAsyncNodeStorageType } from './controller';
import { AbstractCodeBlockAsyncNodeModel } from './model';

// ********************************************************************************
export abstract class AbstractCodeBlockAsyncNodeView<
  T/*value returned by the async function*/,
  NodeType extends CodeBlockAsyncNodeType,
  Storage extends AbstractCodeBlockAsyncNodeStorageType,
  NodeModel extends AbstractCodeBlockAsyncNodeModel<T, NodeType, Storage>>

  // .. AbstractAsyncNodeView Generics ............................................
  extends AbstractAsyncNodeView<T, NodeType, Storage, NodeModel> {

  // ==============================================================================
  public constructor(model: NodeModel, editor: Editor, node: NodeType, asyncNodeStorage: Storage, getPos: getPosType) {
    super(model, editor, node, asyncNodeStorage, getPos);
  }

  // == View ======================================================================
  // creates the DOM element that will be used to display the node's content
  protected createDomElement(): HTMLElement {
    // AbstractCodeBlockAsyncNodeViews are *currently* all inline
    return createInlineNodeContainer();
  }
}

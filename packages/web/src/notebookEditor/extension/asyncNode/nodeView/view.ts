import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { getPosType, AsyncNodeType, ASYNC_NODE_DIRTY_DATATYPE } from '@ureeka-notebook/web-service';

import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

import { AbstractAsyncNodeStorageType } from './controller';
import { AbstractAsyncNodeModel } from './model';

// ********************************************************************************
export abstract class AbstractAsyncNodeView<T, NodeType extends AsyncNodeType, Storage extends AbstractAsyncNodeStorageType, NodeModel extends AbstractAsyncNodeModel<T, NodeType, Storage>> extends AbstractNodeView<AsyncNodeType, AbstractAsyncNodeStorageType, NodeModel> {
  // DOM element that contains the node's content. This element must be created by
  // the Class extending this abstract class with the createViewElement method.
  public content: HTMLElement;

  // ==============================================================================
  public constructor(model: NodeModel, editor: Editor, node: NodeType, asyncNodeStorage: Storage, getPos: getPosType) {
    super(model, editor, node, asyncNodeStorage, getPos);

    this.content = this.createViewElement(node);
    this.dom.appendChild(this.content);
  }

  // == View ======================================================================
  // creates the DOM element that will be used to display the node's content
  protected abstract createDomElement(): HTMLElement;

  // creates a DOM element that will be appended to the node's DOM element. This
  // element will store the classes related to selection.
  protected abstract createViewElement(node: ProseMirrorNode): HTMLElement;

  // ------------------------------------------------------------------------------
  public updateView() {
    const isDirty = this.model.getIsDirty();

    if(isDirty) this.content.setAttribute(ASYNC_NODE_DIRTY_DATATYPE, ''/*does not need a value*/);
    else this.content.removeAttribute(ASYNC_NODE_DIRTY_DATATYPE);

    super.updateView();
  }
}

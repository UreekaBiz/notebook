import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { getPosType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { NodeViewStorage } from './NodeViewStorage';
import { AbstractNodeController } from './AbstractNodeController';
import { AbstractNodeModel } from './AbstractNodeModel';

// Abstract class renders the corresponding DOM nodes for a NodeController
// SEE: {@link AbstractNodeController}
// ********************************************************************************
export abstract class AbstractNodeView<NodeType extends ProseMirrorNode, Storage extends NodeViewStorage<AbstractNodeController<NodeType, any, any, any>>, NodeModel extends AbstractNodeModel<NodeType, Storage>> {
  // == Abstract Node View ========================================================
  // the outer DOM node that represents the Document Node
  public readonly dom: HTMLElement;

  // the DOM node that holds the Node's content. Only meaningful if its Node is not
  // a leaf Node type. When this is present, ProseMirror will take care of rendering
  // the Node's children into it. When it is not present, the Node View itself is
  // responsible for rendering (or deciding not to render) its child Nodes
  public contentDOM?: HTMLElement | null | undefined;

  // ------------------------------------------------------------------------------
  // the corresponding model for this view.
  readonly model: NodeModel;

  // ==============================================================================
  readonly editor: Editor;
  public node: NodeType;
  readonly storage: Storage;
  getPos: getPosType;

  // == Life-Cycle ================================================================
  public constructor(model: NodeModel, editor: Editor, node: NodeType, storage: Storage, getPos: getPosType) {
    this.editor = editor;
    this.node = node;
    this.storage = storage;
    this.getPos = getPos;

    this.model = model;

    // Creates the outer DOM node.
    this.dom = this.createDomElement();
    this.dom.setAttribute(DATA_NODE_TYPE, node.type.name);
  }

  // Sync getPos and node when prosemirror updates it.
  public updateProps(getPos: getPosType){
    this.getPos = getPos;
  }

  // == View ======================================================================
  // creates the outer DOM node that represents the Document Node
  protected abstract createDomElement(): HTMLElement;

  // updates the DOM node that represents the Node
  // NOTE: this method needs to be public since its render view could depend on
  //       an external state (e.g. the visualId of the CodeBlockView) and thus
  //       needs to be called from outside the class.
  public abstract updateView(): void;
}

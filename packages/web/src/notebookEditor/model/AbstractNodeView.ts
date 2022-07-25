import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { NodeView } from 'prosemirror-view';

import { NotebookSchemaType } from '@ureeka-notebook/web-service';

import { getPosType, isGetPos } from 'notebookEditor/extension/util/node';

import { NodeViewStorage } from './NodeViewStorage';

// ********************************************************************************
// Implement the common behavior to all NodeViews that are managed via
// a class implementation
// == Class =======================================================================
export abstract class AbstractNodeView<NodeType extends ProseMirrorNode, Storage extends NodeViewStorage<AbstractNodeView<NodeType, any>>> implements NodeView {
  public readonly storage: Storage;

  // -- ProseMirror ---------------------------------------------------------------
  public readonly editor: Editor;
  public node: NodeType;
  public readonly dom: HTMLElement;
  public contentDOM?: HTMLElement;
  public readonly getPos: (() => number);

  // == Life-Cycle ================================================================
  public constructor(editor: Editor, node: NodeType, storage: Storage, getPos: getPosType) {
    if(!isGetPos(getPos)) throw new Error('getPos is not a function when creating an AbstractNodeView');

    this.storage = storage;
    this.storage.addNode(node.attrs.id, this);

    // .. ProseMirror .............................................................
    this.editor = editor;
    this.dom = this.createDomElement();
    this.node = node;
    this.getPos = getPos;
  }

  // == PM Life-Cycle =============================================================
  public update(node: ProseMirrorNode<NotebookSchemaType>): boolean {
    if(this.node.type.name !== node.type.name) return false/*different node so nothing was updated*/;

    // update both storage and our reference to the Node
    this.storage.addNode(this.node.attrs.id, this);
    this.node = node as NodeType/*above check guarantees*/;

    this.updateView();
    return true/*as far as this implementation is concerned, an update occurred*/;
  }

  // ==============================================================================
  // .. View ......................................................................
  protected abstract createDomElement(): HTMLElement;
  protected abstract updateView(): void;
}

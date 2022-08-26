import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { NodeView as ProseMirrorNodeView } from 'prosemirror-view';

import { getPosType, isGetPos, AttributeType, NotebookSchemaType } from '@ureeka-notebook/web-service';

import { AbstractNodeView } from './AbstractNodeView';
import { AbstractNodeModel } from './AbstractNodeModel';
import { isNodeViewStorage, NodeViewStorage } from './NodeViewStorage';
import { NoStorage } from './type';

// ********************************************************************************
// == Class =======================================================================
export abstract class AbstractNodeController<NodeType extends ProseMirrorNode, Storage extends NodeViewStorage<AbstractNodeController<NodeType, any, any, any>> | NoStorage, NodeModel extends AbstractNodeModel<NodeType, any> = any, NodeView extends AbstractNodeView<NodeType, Storage, NodeModel> = any>implements ProseMirrorNodeView {
  // == ProseMirror NodeView ======================================================
  public readonly dom: HTMLElement;
  public contentDOM?: HTMLElement | null | undefined;

  // ==============================================================================
  readonly nodeView: NodeView/*initialized by the subclass*/;
  readonly nodeModel: NodeModel/*initialized by the subclass*/;

  public readonly storage: Storage;
  public readonly editor: Editor;
  public node: NodeType;
  public getPos: (() => number);

  // == Life-Cycle ================================================================
  public constructor(nodeModel: NodeModel, nodeView: NodeView, editor: Editor, node: NodeType, storage: Storage, getPos: getPosType) {
    if(!isGetPos(getPos)) throw new Error('getPos is not a function when creating an AbstractNodeController');
    this.editor = editor;
    this.node = node;
    this.getPos = getPos;
    this.storage = storage;

    // only add the Storage if it is a NodeViewStorage (so NoStorage is not added)
    if(this.storage && isNodeViewStorage(this.storage)) this.storage.addNodeView(node.attrs[AttributeType.Id], this);

    this.nodeModel = nodeModel;
    this.nodeView = nodeView;

    // hook up the nodeView to this controller
    this.dom = this.nodeView.dom;
    this.contentDOM = this.nodeView.contentDOM;
  }

  // Sync getPos and node when prosemirror updates it.
  public updateProps(getPos: getPosType){
    if(!isGetPos(getPos)) throw new Error('getPos is not a function when calling updateProps');
    this.getPos = getPos;

    this.nodeModel.updateProps(getPos);
    this.nodeView.updateProps(getPos);
  }

  // == PM Life-Cycle =============================================================
  public update(node: ProseMirrorNode<NotebookSchemaType>): boolean {
    if(this.node.type.name !== node.type.name) return false/*different node so nothing was updated*/;

    // update both storage and our reference to the Node
    if(this.storage && isNodeViewStorage(this.storage)) this.storage.addNodeView(this.node.attrs[AttributeType.Id], this);
    // updates node in the model and view
    this.node = node as NodeType/*above check guarantees*/;
    this.nodeModel.node = node as NodeType/*above check guarantees*/;
    this.nodeView.node = node as NodeType/*above check guarantees*/;

    this.nodeView.updateView();
    return true/*as far as this implementation is concerned, an update occurred*/;
  }

  // called by ProseMirror when the node is removed
  public destroy() {
    // NOTE: the View and the Model are destroyed in the inverse order of
    //       their creation to prevent any issues with the View
    this.nodeView.destroy();
    this.nodeModel.destroy();
  }

  /** updates the selected state and update the view to reflect the changes */
  public selectNode() {
    this.nodeModel.setSelected(true);
    this.nodeView.updateView();
  }
  public deselectNode() {
    this.nodeModel.setSelected(false);
    this.nodeView.updateView();
  }
}

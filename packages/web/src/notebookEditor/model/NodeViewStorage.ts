import { Editor } from '@tiptap/core';

import { getLogger, Logger, NodeIdentifier, NodeName } from '@ureeka-notebook/web-service';

import { AbstractNodeController } from 'notebookEditor/model/AbstractNodeController';

import { AbstractNodeView } from './AbstractNodeView';

const log = getLogger(Logger.NOTEBOOK);

// ********************************************************************************
// returns the NodeViewStorage that manages all AbstractNodeViews for a particular
// type of Node (specified)
export const getNodeViewStorage = <Storage extends NodeViewStorage<any>>(editor: Editor, nodeName: NodeName): Storage => {
  const storage = editor.storage[nodeName];
  if(!isNodeViewStorage<Storage>(storage)) throw new Error(`Invalid storage for Node (${nodeName}): ${JSON.stringify(storage)}`);

  return storage;
};

// ********************************************************************************
// provides common properties to all storage objects used by AbstractNodeController
export class NodeViewStorage<V extends AbstractNodeController<any, any>> {
  private readonly nodeViewMap = new Map<NodeIdentifier, V>();

  // == Life-cycle ================================================================
  public constructor() {/*currently nothing*/}

  // == NodeViews =================================================================
  // retrieves the node view for the specified node identifier. Such a node view
  // may not exist
  public getNodeView(id: NodeIdentifier) { return this.nodeViewMap.get(id); }

  // adds or updates the specified node view to storage
  public addNodeView(id: NodeIdentifier, nodeView: V) { this.nodeViewMap.set(id, nodeView); }

  // removes the specified node view from storage and destroys any ReactNodeView
  // that is associated with it.
  public removeNodeView(id: NodeIdentifier) {
    const nodeView = this.nodeViewMap.get(id);
    if(!nodeView) { log.warn(`NodeView not found for Node (${id}). Ignoring.`); return/*nothing to do*/; }

    // unmounts the ReactNodeView if it exists
    // NOTE: this is a hack to get around the fact that the NodeView is a generic
    //       type.
    const view = nodeView.nodeView as AbstractNodeView<any, any, any>;
    if(view.reactNodeView) view.ReactRoot.unmount();

    // removes the node view from storage
    this.nodeViewMap.delete(id);
  }

  /** Calls the specified callback for each NodeView in Storage */
  public forEachNodeView(operation: (nodeView: V) => void) {
    this.nodeViewMap.forEach(nodeView => operation(nodeView));
  }
}

export const isNodeViewStorage = <Storage extends NodeViewStorage<any>>(obj: any): obj is Storage =>
  'nodeViewMap' in obj;

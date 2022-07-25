import { Editor } from '@tiptap/core';

import { NodeIdentifier, NodeName } from '@ureeka-notebook/web-service';
import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

// ********************************************************************************
/**
 * returns the {@link NodeViewStorage} that manages all {@link AbstractNodeViews}
 * for a particular type of node
 */
export const getNodeViewStorage = <NV extends AbstractNodeView<any, any>>(editor: Editor, nodeName: NodeName): NodeViewStorage<NV> => {
  const storage = editor.storage[nodeName];
  if(!isNodeViewStorage<NV>(storage)) throw new Error(`Invalid storage for node (${nodeName}): ${JSON.stringify(storage)}`);

  return storage;
};

// ********************************************************************************
/**
 * Implements the common properties to all storage objects used by {@link AbstractNodeViews}
 */
export class NodeViewStorage<V extends AbstractNodeView<any, any>> {
  private readonly nodeViewMap = new Map<NodeIdentifier, V>();

  // == Life-cycle ================================================================
  public constructor() {/*currently nothing*/}

  // == NodeViews =================================================================
  // retrieves the node view for the specified node identifier. Such a node view
  // may not exist
  public getNode(id: NodeIdentifier) { return this.nodeViewMap.get(id); }

  // adds or updates the specified node view to storage
  public addNode(id: NodeIdentifier, nodeView: V) { this.nodeViewMap.set(id, nodeView); }

  // removes the specified node view from storage
  public removeNode(id: NodeIdentifier) { this.nodeViewMap.delete(id); }
}

export const isNodeViewStorage = <NV extends AbstractNodeView<any, any>>(obj: any): obj is NodeViewStorage<NV> =>
  'nodeViewMap' in obj;

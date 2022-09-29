import { Editor } from '@tiptap/core';
import { Node } from 'prosemirror-model';
import { Observable, Subject } from 'rxjs';

import { getNodesAffectedByTransaction, getNodeName, NodeIdentifier, NodeName } from '@ureeka-notebook/service-common';

import { ApplicationError } from '../../util';
import { nodeChangeById$, nodeChangesByNodeName$ } from './observable';
import { NodeChange, NodeChanges, TransactionEvent } from './type';

// NOTE: This is a WIP. The main problem is to figure out how to inform the
//       Subscribers when a Node is deleted. The current implementation only informs
//       on changes that occur to the Node itself, not when the Node is deleted.
// ********************************************************************************
// handle the subscriptions to changes for nodes in the editor.
//
// Complexities come from the following:
// - A single transaction can update the same node multiple times, this causes the
//   node to be emitted multiple times in a single Event.
// - How to handle the case where a node is deleted.
// - How to handle the case where a node is moved (i.e. its position changes due to
//   a node being added before).
export class NodeObserver {
  private editor: Editor;

  private initialized: boolean = false/*by default*/;

  // Observable that emits when there is a Transaction on the Editor that caused a
  // node to be updated (i.e. a node was added, removed, or updated). The emitted
  // value will be all the nodes that changed on the given Transaction. Transactions
  // that don't emit a NodeChange will be ignored (i.e. selection update).
  private changes$: Subject<NodeChanges>;

  private unsubscribe: (() => void) | undefined/*not subscribed*/;

  // == Lifecycle =================================================================
  public constructor(editor: Editor) {
    this.editor = editor;

    // store the subscriber. There is no need to store the unsubscribe function since
    // the unsubscribe is handled by the `shutdown()` method.
    this.changes$ = new Subject();
  }

  /**
   * Listens to the associated {@link Editor}. This should be called once and only
   * once until {@link #shutdown()} is called (an error is thrown if already
   * initialized).
   *
   * @see #shutdown()
   */
   public async initialize() {
    if(this.initialized) throw new ApplicationError('functions/internal', `Node Observable already initialized. (One-shot only.)`);
    this.initialized = true/*by contract*/;

    // listen to changes and send them to Firestore
    await this.listenEditor();
  }

  /**
   * Cancels the listeners associated with the Editor. Shutting down an already
   * shut-down (or never {@link #initialize()}d) listener has no effect. This will
   * free up resources associated with the listeners and is required.
   *
   * @see #initialize()
   */
  public async shutdown() {
    if(!this.initialized) throw new ApplicationError('functions/internal', `Notebook observable already shut down (or never initialized).`);

    if(this.unsubscribe) this.unsubscribe();

    // NOTE: explicitly *not* setting `initialized = false` because this is one-shot
  }

  // == Observable ================================================================
  // -- Node ----------------------------------------------------------------------
  /**
   * @returns an Observable over the changes to the {@link Node} identified by the
   *         given {@link NodeName} and {@link NodeId}.
  */
  public onNode$<T extends Node>(nodeName: NodeName, id: NodeIdentifier): Observable<NodeChange<T> | null/*not-found*/> {
    return nodeChangeById$<T>(nodeName, id, this.changes$);
  }

  /**
   * @returns and Observable over the changes for all {@link Node}s in the identified
   *         {@link NodeName}.
   */
  public onNodes$<T extends Node>(nodeName: NodeName): Observable<NodeChange<T>[]> {
    return nodeChangesByNodeName$<T>(nodeName, this.changes$);
  }

  // == Subscription ==============================================================
  private listenEditor(){
    const callback = this.onTransaction.bind(this);

    this.editor.on('transaction', callback);
    this.unsubscribe = () => this.editor.off('transaction', callback);
  }

  private onTransaction({ transaction }: TransactionEvent) {
    const affectedNodes = getNodesAffectedByTransaction(transaction);
    if(affectedNodes.length < 1) return/*no changes -- nothing to do*/;

    // create a new map with the node changes
    const changes = new Map<NodeName, NodeChange[]>();
    affectedNodes.forEach(({ node, position }) => {
      const nodeName = getNodeName(node);
      const nodeChange = { node, position };

      // add the node change to the map of changes
      const nodeChangesForNode = changes.get(nodeName) || []/*create if not exists yet*/;
            nodeChangesForNode.push(nodeChange);

      changes.set(nodeName, nodeChangesForNode);
    });

    // emit the changes
    this.changes$.next(changes);
  }
}

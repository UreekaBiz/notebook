import { Editor } from '@tiptap/core';

import { getPosType, AsyncNodeType, AsyncNodeStatus } from '@ureeka-notebook/web-service';

import { AbstractNodeModel } from 'notebookEditor/model/AbstractNodeModel';

import { AbstractAsyncNodeStorageType } from './controller';

// ********************************************************************************
/**
 * Abstract class that serves as the base model for all async nodes.
 *
 * @see: {@link AbstractAsyncNodeController}, {@link AbstractAsyncNodeView}
 */
export abstract class AbstractAsyncNodeModel<T, NodeType extends AsyncNodeType, Storage extends AbstractAsyncNodeStorageType> extends AbstractNodeModel<AsyncNodeType, AbstractAsyncNodeStorageType> {
  // == Attribute =================================================================
  // defines if the current node is performing an async operation
  // NOTE: This value must be set only by the executeAsyncCall method.
  private performingAsyncOperation: boolean;

  // the content that generated the previous async call has changed
  private isDirty: boolean;

  // == Lifecycle =================================================================
  public constructor(editor: Editor, node: NodeType, storage: Storage, getPos: getPosType) {
    super(editor, node, storage, getPos);

    this.performingAsyncOperation = false;
    this.isDirty = false/*initially dirty by contract*/;
  }

  // == Async =====================================================================
  /**
   * Executes the async call.
   *
   * The caller *must* ensure that the Node is not already performing an async
   * operation, and handle its errors. If the error relates to the status of the
   * async node, then the caller must deal with it (update the node status), let
   * the view know about it, etc. Otherwise, the error bubbles out and is displayed
   * as a toast by React (SEE: ExecuteAsyncNodeButton.tsx)
   *
   * The subclass implementing this method must ensure that the semantics of
   * executing the asyncCall are followed correctly (i.e., must the node be replaced
   * entirely, or must only its content be replaced?) as part of the process of
   * executing the async call
   *
   */
  public abstract executeAsyncCall(): Promise<boolean/*whether or not the view was updated*/>;

  // == Model =====================================================================
  // -- Getters / Setters ---------------------------------------------------------
  public abstract isAsyncNodeDirty(): boolean;
  public getIsDirty() { return this.isDirty; }
  public setIsDirty(isDirty: boolean) { this.isDirty = isDirty; }

  public getPerformingAsyncOperation() { return this.performingAsyncOperation; }
  public setPerformingAsyncOperation(performingAsyncOperation: boolean) { this.performingAsyncOperation = performingAsyncOperation; }

  // -- Abstract methods ----------------------------------------------------------
  // returns the actual promise that gets the value to be rendered by the node and
  // will be executed by the executeAsyncCall method.
  protected abstract createPromise(): Promise<T> | T;

  // computes a state based on the result given by createPromise.
  protected abstract getStatusFromResult(result: T): AsyncNodeStatus;
}

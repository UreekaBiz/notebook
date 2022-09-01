import { AsyncNodeType } from '@ureeka-notebook/web-service';

import { AbstractNodeController } from 'notebookEditor/model/AbstractNodeController';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { AbstractAsyncNodeModel } from './model';
import { AbstractAsyncNodeView } from './view';

// ********************************************************************************
// NOTE: AbstractAsyncNodeStorageType is not meant to be used directly, is just
//       a placeholder for the type of the AbstractNode controller, model and view.
//       The unknown and any types used in AbstractAsyncNodeController are used to
//       fill the generic values and don't represent the actual type of the Storage,
//       it will be replaced with actual values when this class is extended.
export type AbstractAsyncNodeStorageType = NodeViewStorage<AbstractAsyncNodeController<unknown, any, any, any, any>>;
export abstract class AbstractAsyncNodeController<T/*value returned by the async function*/, NodeType extends AsyncNodeType, Storage extends AbstractAsyncNodeStorageType, NodeModel extends AbstractAsyncNodeModel<T, NodeType, Storage> = any, NodeView extends AbstractAsyncNodeView<T, NodeType, Storage, NodeModel> = any> extends AbstractNodeController<AsyncNodeType, AbstractAsyncNodeStorageType, NodeModel, NodeView> {
  // == Execution =================================================================
  public async executeAsyncCall() {
    if(this.nodeModel.getPerformingAsyncOperation()) return/*don't execute twice at the same time*/;

    try {
      // NOTE: updating performingAsyncOperation is at this level since the view
      //       will need to know if the node is performing an async operation
      this.nodeModel.setPerformingAsyncOperation(true/*by contract*/);
      this.nodeView.updateView();

      await this.nodeModel.executeAsyncCall();
    } catch(error) {
      // NOTE: Caller should handle the error, otherwise this bubbles to React
      throw new Error(`${error}`);
    } finally {
      this.nodeModel.setPerformingAsyncOperation(false)/*by definition*/;
      this.nodeView.updateView()/*updates the view to reflect the new state*/;
    }
  }

  // == Util ======================================================================
  // updates the isDirty state and the viewElement to reflect the current state
  public setDirty(isDirty: boolean) {
    this.nodeModel.setIsDirty(isDirty);
    this.nodeView.updateView();
  }
}

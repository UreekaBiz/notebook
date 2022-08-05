import { CodeBlockAsyncNodeType } from '@ureeka-notebook/web-service';

import { AbstractAsyncNodeController } from 'notebookEditor/extension/asyncNode/nodeView/controller';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { AbstractCodeBlockAsyncNodeModel } from './model';
import { AbstractCodeBlockAsyncNodeView } from './view';

// ********************************************************************************
// --------------------------------------------------------------------------------
// NOTE: AbstractCodeBlockAsyncNodeStorageType is not meant to be used directly,
//       its just a placeholder for the type of the AbstractNode controller,
//       model and view. The unknown and any types used in
//       AbstractAsyncNodeController are used to fill the generic values and
//       don't represent the actual type of the Storage, it will be replaced
//       with actual values when this class is extended.
export type AbstractCodeBlockAsyncNodeStorageType = NodeViewStorage<AbstractAsyncNodeController<unknown, any, any, any, any>>;

// --------------------------------------------------------------------------------
export abstract class AbstractCodeBlockAsyncNodeController

  // .. AbstractCodeBlockAsyncNodeModel Generics ....................................
  <T/*value returned by the async function*/,
  NodeType extends CodeBlockAsyncNodeType,
  Storage extends AbstractCodeBlockAsyncNodeStorageType,
  NodeModel extends AbstractCodeBlockAsyncNodeModel<T, NodeType, Storage> = any,
  NodeView extends AbstractCodeBlockAsyncNodeView<T, NodeType, Storage, NodeModel> = any>

  // .. AbstractAsyncNodeController Generics ....................................
  extends AbstractAsyncNodeController<T, NodeType, Storage, NodeModel, NodeView> {
    // currently no extra behavior at the controller level
}

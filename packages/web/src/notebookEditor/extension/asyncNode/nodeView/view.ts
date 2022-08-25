import { AsyncNodeType } from '@ureeka-notebook/web-service';

import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

import { AbstractAsyncNodeStorageType } from './controller';
import { AbstractAsyncNodeModel } from './model';

// ********************************************************************************
export abstract class AbstractAsyncNodeView<T, NodeType extends AsyncNodeType, Storage extends AbstractAsyncNodeStorageType, NodeModel extends AbstractAsyncNodeModel<T, NodeType, Storage>> extends AbstractNodeView<AsyncNodeType, AbstractAsyncNodeStorageType, NodeModel> {
  // no need to implement
}

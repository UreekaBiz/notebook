import { Editor } from '@tiptap/core';

import { getPosType, NestedViewBlockNodeType } from '@ureeka-notebook/web-service';

import { AbstractNestedViewNodeView } from 'notebookEditor/extension/nestedViewNode/nodeView/view';

import { NestedViewBlockNodeModel } from './model';
import { NestedViewBlockNodeStorageType } from './controller';

// ********************************************************************************
export class NestedViewBlockNodeView extends AbstractNestedViewNodeView<NestedViewBlockNodeType, NestedViewBlockNodeStorageType, NestedViewBlockNodeModel> {
  // == Lifecycle =================================================================
  public constructor(model: NestedViewBlockNodeModel, editor: Editor, node: NestedViewBlockNodeType, storage: NestedViewBlockNodeStorageType, getPos: getPosType) {
    super(model, editor, node, storage, getPos);

    // currently nothing else required
  }
}

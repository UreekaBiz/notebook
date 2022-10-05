import { Editor } from '@tiptap/core';

import { getPosType, NestedViewNodeType } from '@ureeka-notebook/web-service';

import { AbstractNodeModel } from 'notebookEditor/model/AbstractNodeModel';

import { AbstractNestedNodeViewNodeStorageType } from './controller';

// ********************************************************************************
/** Abstract class that serves as the base model for all NestedViewNodes */
export abstract class AbstractNestedViewNodeModel<NodeType extends NestedViewNodeType, Storage extends AbstractNestedNodeViewNodeStorageType> extends AbstractNodeModel<NestedViewNodeType, AbstractNestedNodeViewNodeStorageType> {
  // == Attribute =================================================================
  // whether or not the Node is currently being edited
	public isEditing: boolean;

  // == Lifecycle =================================================================
  public constructor(editor: Editor, node: NodeType, storage: Storage, getPos: getPosType) {
    super(editor, node, storage, getPos);
		this.isEditing = false/*default*/;
  }
}

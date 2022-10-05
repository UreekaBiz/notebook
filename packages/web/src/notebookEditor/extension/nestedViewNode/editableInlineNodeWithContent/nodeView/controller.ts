import { Editor } from '@tiptap/core';

import { getPosType, EditableInlineNodeWithContentNodeType } from '@ureeka-notebook/web-service';

import { AbstractNestedNodeViewNodeController } from 'notebookEditor/extension/nestedViewNode/nodeView/controller';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';

import { EditableInlineNodeWithContentModel } from './model';
import { EditableInlineNodeWithContentView } from './view';

// ********************************************************************************
export type EditableInlineNodeWithContentStorageType = NodeViewStorage<EditableInlineNodeWithContentController>

// == Controller ==================================================================
export class EditableInlineNodeWithContentController extends AbstractNestedNodeViewNodeController<EditableInlineNodeWithContentNodeType, EditableInlineNodeWithContentStorageType, EditableInlineNodeWithContentModel, EditableInlineNodeWithContentView> {
  // == Lifecycle =================================================================
  public constructor(editor: Editor, node: EditableInlineNodeWithContentNodeType, storage: EditableInlineNodeWithContentStorageType, getPos: getPosType) {
    const model = new EditableInlineNodeWithContentModel(editor, node, storage, getPos),
          view = new EditableInlineNodeWithContentView(model, editor, node, storage, getPos);

    super(model, view, editor, node, storage, getPos);
  }
}

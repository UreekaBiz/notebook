import { Editor } from '@tiptap/core';

import { getPosType, EditableInlineNodeWithContentNodeType } from '@ureeka-notebook/web-service';

import { AbstractNestedViewNodeView } from 'notebookEditor/extension/nestedViewNode/nodeView/view';

import { EditableInlineNodeWithContentModel } from './model';
import { EditableInlineNodeWithContentStorageType } from './controller';

// ********************************************************************************
export class EditableInlineNodeWithContentView extends AbstractNestedViewNodeView<EditableInlineNodeWithContentNodeType, EditableInlineNodeWithContentStorageType, EditableInlineNodeWithContentModel> {
  // == Lifecycle =================================================================
  public constructor(model: EditableInlineNodeWithContentModel, editor: Editor, node: EditableInlineNodeWithContentNodeType, storage: EditableInlineNodeWithContentStorageType, getPos: getPosType) {
    super(model, editor, node, storage, getPos);

    // currently nothing else required
  }
}

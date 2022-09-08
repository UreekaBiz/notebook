import { Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { getPosType, isTaskListItemNode, NotebookSchemaType, TaskListItemNodeType } from '@ureeka-notebook/web-service';

import { NoStorage } from 'notebookEditor/model/type';
import { AbstractNodeController } from 'notebookEditor/model/AbstractNodeController';

import { TaskListItemModel } from './model';
import { TaskListItemView } from './view';

// ********************************************************************************
export class TaskListItemController extends AbstractNodeController<TaskListItemNodeType, NoStorage, TaskListItemModel, TaskListItemView> {
  // == Lifecycle =================================================================
  public constructor(editor: Editor, node: TaskListItemNodeType, taskListItemStorage: NoStorage, getPos: getPosType) {
    const model = new TaskListItemModel(editor, node, taskListItemStorage, getPos),
          view = new TaskListItemView(model, editor, node, taskListItemStorage, getPos);

    super(model, view, editor, node, taskListItemStorage, getPos);
    this.nodeView.updateView();
  }

  // .. Update ....................................................................
  public update(node: ProseMirrorNode<NotebookSchemaType>): boolean {
    if(!isTaskListItemNode(node)) return false/*nothing else to do*/;

    // Update node and node view
    this.node = node;
    this.nodeView.updateView();
    return true;
  }
}

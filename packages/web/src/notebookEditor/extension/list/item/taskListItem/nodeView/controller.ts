import { Editor } from '@tiptap/core';

import { getPosType, TaskListItemNodeType } from '@ureeka-notebook/web-service';

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
}

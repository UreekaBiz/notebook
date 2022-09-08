import { NodeName } from '@ureeka-notebook/web-service';

import { Toolbar } from 'notebookEditor/toolbar/type';

import { bulletListToolItem, orderedListToolItem, startNewListToolItem, taskListToolItem } from '../toolbar';

// ********************************************************************************
// == Toolbar =====================================================================
export const TaskListToolbar: Toolbar = {
  title: 'Task List',
  name: NodeName.TASK_LIST/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      orderedListToolItem,
      bulletListToolItem,
      taskListToolItem,
      startNewListToolItem,
    ],
  ],
};

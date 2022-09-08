import { NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { Toolbar } from 'notebookEditor/toolbar/type';

//*********************************************************************************
// == Toolbar =====================================================================
export const TaskListItemToolbar: Toolbar = {
  title: 'Task List Item',
  name: NodeName.TASK_LIST_ITEM/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      markBold,
      markStrikethrough,
    ],
  ],
};

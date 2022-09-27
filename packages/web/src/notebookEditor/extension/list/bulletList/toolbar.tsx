import { NodeName } from '@ureeka-notebook/web-service';

import { Toolbar } from 'notebookEditor/sidebar/toolbar/type';

import { bulletListToolItem, orderedListToolItem, startNewListToolItem, taskListToolItem } from '../toolbar';

// ********************************************************************************
// == Toolbar =====================================================================
export const BulletListToolbar: Toolbar = {
  title: 'Bullet List',
  name: NodeName.BULLET_LIST,

  toolsCollections: [
    [
      orderedListToolItem,
      bulletListToolItem,
      taskListToolItem,
      startNewListToolItem,
    ],
  ],
};

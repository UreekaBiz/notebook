import { NodeName } from '@ureeka-notebook/web-service';

import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { bulletListToolItem, orderedListToolItem, shouldShowListToolItem, startNewListToolItem, taskListToolItem } from '../../toolbar';
import { OrderedListSchemeToolItem } from './OrderedListSchemeToolItem';
import { OrderedListSeparatorToolItem } from './OrderedListSeparatorToolItem';

// ********************************************************************************
// == Tool Items ==================================================================
const orderedListSeparatorToolItem: ToolItem = {
  toolType: 'component',
  name: 'orderedListSeparatorToolItem',

  shouldShow: (editor, depth) => shouldShowListToolItem(editor, depth),
  component: OrderedListSeparatorToolItem,
};

const orderedListSchemeToolItem: ToolItem = {
  toolType: 'component',
  name: 'orderedListSchemeToolItem',

  shouldShow: (editor, depth) => shouldShowListToolItem(editor, depth),
  component: OrderedListSchemeToolItem,
};

// == Toolbar =====================================================================
export const OrderedListToolbar: Toolbar = {
  title: 'Ordered List',
  name: NodeName.ORDERED_LIST/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      orderedListSeparatorToolItem,
      orderedListSchemeToolItem,
    ],
    [
      orderedListToolItem,
      bulletListToolItem,
      taskListToolItem,
      startNewListToolItem,
    ],
  ],
};

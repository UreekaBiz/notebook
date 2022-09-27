import { NodeName } from '@ureeka-notebook/web-service';

import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { bulletListToolItem, orderedListToolItem, shouldShowListToolItem, startNewListToolItem, taskListToolItem } from '../../toolbar';
import { OrderedListSchemeToolItem } from './OrderedListSchemeToolItem';
import { OrderedListSeparatorToolItem } from './OrderedListSeparatorToolItem';
import { OrderedListStartValueToolItem } from './OrderedListStartValueToolItem';

// ********************************************************************************
// == Tool Items ==================================================================
const orderedListStartValueToolItem: ToolItem = {
  toolType: 'component',
  name: 'orderedListStartValueToolItem',

  shouldShow: shouldShowListToolItem,
  component: OrderedListStartValueToolItem,
};

const orderedListSeparatorToolItem: ToolItem = {
  toolType: 'component',
  name: 'orderedListSeparatorToolItem',

  shouldShow: shouldShowListToolItem,
  component: OrderedListSeparatorToolItem,
};

const orderedListSchemeToolItem: ToolItem = {
  toolType: 'component',
  name: 'orderedListSchemeToolItem',

  shouldShow: shouldShowListToolItem,
  component: OrderedListSchemeToolItem,
};

// == Toolbar =====================================================================
export const OrderedListToolbar: Toolbar = {
  title: 'Ordered List',
  name: NodeName.ORDERED_LIST/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      orderedListStartValueToolItem,
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

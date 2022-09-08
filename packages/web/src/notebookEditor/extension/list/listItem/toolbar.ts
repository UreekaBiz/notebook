import { NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { Toolbar } from 'notebookEditor/toolbar/type';

//*********************************************************************************
// == Toolbar =====================================================================
export const ListItemToolbar: Toolbar = {
  title: 'List Item',
  name: NodeName.LIST_ITEM/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      markBold,
      markStrikethrough,
    ],
  ],
};

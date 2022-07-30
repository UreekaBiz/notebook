import { NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { fontSizeToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { Toolbar } from 'notebookEditor/toolbar/type';

//*********************************************************************************
export const TitleToolbar: Toolbar = {
  title: 'Title',
  nodeName: NodeName.TITLE,

  toolsCollections: [
    [
      markBold,
      markStrikethrough,
    ],
    [
      fontSizeToolItem,
      textColorToolItem,
    ],
  ],
};

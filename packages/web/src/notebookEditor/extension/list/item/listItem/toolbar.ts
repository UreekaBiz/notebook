import { NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markCode } from 'notebookEditor/extension/code/toolbar';
import { codeBlockReferenceToolItem } from 'notebookEditor/extension/codeBlockReference/toolbar';
import { demoAsyncNodeToolItem } from 'notebookEditor/extension/demoAsyncNode/toolbar';
import { markItalic } from 'notebookEditor/extension/italic/toolbar';
import { linkToolItem } from 'notebookEditor/extension/link/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { markSubScript } from 'notebookEditor/extension/subScript/toolbar';
import { markSuperScript } from 'notebookEditor/extension/superScript/toolbar';
import { fontSizeToolItem, highlightColorMarkToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { markUnderline } from 'notebookEditor/extension/underline/toolbar';
import { Toolbar } from 'notebookEditor/sidebar/toolbar/type';

import { listItemContentBackgroundColorToolItem } from '../listItemContent/toolbar';
import { dedentListToolItem, indentListToolItem } from '../toolItem';

//*********************************************************************************
// == Toolbar =====================================================================
export const ListItemToolbar: Toolbar = {
  title: 'List Item',
  name: NodeName.LIST_ITEM/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      listItemContentBackgroundColorToolItem,
      fontSizeToolItem,
      textColorToolItem,
      highlightColorMarkToolItem,
      markBold,
      markItalic,
      markUnderline,
      markStrikethrough,
      markSuperScript,
      markSubScript,
      markCode,
      linkToolItem,
      demoAsyncNodeToolItem,
      codeBlockReferenceToolItem,
      dedentListToolItem,
      indentListToolItem,
    ],
  ],
};

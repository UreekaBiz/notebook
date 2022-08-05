import { NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { codeBlockToolItem } from 'notebookEditor/extension/codeblock/toolbar';
import { demo2AsyncNodeToolItem } from 'notebookEditor/extension/demo2AsyncNode/toolbar';
import { demoAsyncNodeToolItem } from 'notebookEditor/extension/demoAsyncNode/toolbar';
import { heading1, heading2, heading3 } from 'notebookEditor/extension/heading/toolbar';
import { imageToolItem } from 'notebookEditor/extension/image/toolbar';
import { linkToolItem } from 'notebookEditor/extension/link/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { fontSizeToolItem, spacingToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { Toolbar } from 'notebookEditor/toolbar/type';

//*********************************************************************************
// == Toolbar =====================================================================
export const ParagraphToolbar: Toolbar = {
  title: 'Paragraph',
  name: NodeName.PARAGRAPH/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      markBold,
      markStrikethrough,
      linkToolItem,
    ],
    [
      demo2AsyncNodeToolItem,
      demoAsyncNodeToolItem,
      codeBlockToolItem,
      heading1,
      heading2,
      heading3,
    ],
    [
      imageToolItem,
    ],
    [
      fontSizeToolItem,
      textColorToolItem,
    ],
    [
      spacingToolItem,
    ],
  ],
};

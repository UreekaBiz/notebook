import { NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { heading1, heading2, heading3 } from 'notebookEditor/extension/heading/toolbar';
import { imageToolItem } from 'notebookEditor/extension/image/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { fontSizeToolItem, spacingToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { Toolbar } from 'notebookEditor/toolbar/type';

//*********************************************************************************
// == Toolbar =====================================================================
export const ParagraphToolbar: Toolbar = {
  title: 'Paragraph',
  nodeName: NodeName.PARAGRAPH/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      markBold,
      markStrikethrough,
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

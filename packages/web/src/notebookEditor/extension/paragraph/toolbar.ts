import { NodeName } from '@ureeka-notebook/web-service';
import { heading1, heading2, heading3 } from 'notebookEditor/toolbar/block';
import { fontSizeToolItem, markBold, spacingToolItem, textColorToolItem } from 'notebookEditor/toolbar/mark';
import { EditorToolbar } from 'notebookEditor/toolbar/type';

//*********************************************************************************
export const ParagraphToolbar: EditorToolbar = {
  nodeName: NodeName.PARAGRAPH,

  toolsCollections: [
    [
      markBold,
      heading1,
      heading2,
      heading3,
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

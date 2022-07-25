import { Editor } from '@tiptap/core';

import { HeadingLevel, NodeName } from '@ureeka-notebook/web-service';

import { heading1, heading2, heading3 } from 'notebookEditor/toolbar/block';
import { fontSizeToolItem, markBold, spacingToolItem, textColorToolItem } from 'notebookEditor/toolbar/mark';
import { EditorToolbar } from 'notebookEditor/toolbar/type';

//*********************************************************************************
export const HeadingToolbar: EditorToolbar = {
  nodeName: NodeName.HEADING,

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

// == Toolbar =====================================================================
export const isHeadingToolActive = (editor: Editor, toolName: string/*in the form of ${HeadingName}{number}*/) => {
  const { selection } = editor.state;

  switch(toolName) {
    case `${NodeName.HEADING}1`:
      return editor.isActive(NodeName.HEADING) && selection.$anchor.parent.attrs.level === HeadingLevel.One;
    case `${NodeName.HEADING}2`:
      return editor.isActive(NodeName.HEADING) && selection.$anchor.parent.attrs.level === HeadingLevel.Two;
    case `${NodeName.HEADING}3`:
      return editor.isActive(NodeName.HEADING) && selection.$anchor.parent.attrs.level === HeadingLevel.Three;
    default:
      return false;
  }
};

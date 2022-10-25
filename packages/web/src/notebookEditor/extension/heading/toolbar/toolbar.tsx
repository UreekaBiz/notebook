import { AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { blockquoteToolItem } from 'notebookEditor/extension/blockquote/toolbar';
import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markCode } from 'notebookEditor/extension/code/toolbar';
import { codeBlockToolItem } from 'notebookEditor/extension/codeblock/toolbar';
import { codeBlockReferenceToolItem } from 'notebookEditor/extension/codeBlockReference/toolbar';
import { demo2AsyncNodeToolItem } from 'notebookEditor/extension/demo2AsyncNode/toolbar';
import { demoAsyncNodeToolItem } from 'notebookEditor/extension/demoAsyncNode/toolbar';
import { horizontalRuleToolItem } from 'notebookEditor/extension/horizontalRule/toolbar/toolbar';
import { imageToolItem } from 'notebookEditor/extension/image/toolbar';
import { markItalic } from 'notebookEditor/extension/italic/toolbar';
import { linkToolItem } from 'notebookEditor/extension/link/toolbar';
import { bulletListToolItem, orderedListToolItem, taskListToolItem } from 'notebookEditor/extension/list/toolbar';
import { editableInlineNodeWithContentToolItem } from 'notebookEditor/extension/nestedViewNode/editableInlineNodeWithContent/toolbar';
import { nestedViewBlockNodeToolItem } from 'notebookEditor/extension/nestedViewNode/nestedViewBlockNode/toolbar';
import { ColorPickerNodeToolItem } from 'notebookEditor/extension/shared/component/ColorPickerToolItem';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { markSubScript } from 'notebookEditor/extension/subScript/toolbar';
import { markSuperScript } from 'notebookEditor/extension/superScript/toolbar';
import { backgroundColorMarkToolItem, fontSizeToolItem, spacingToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { markUnderline } from 'notebookEditor/extension/underline/toolbar';
import { dedentBlocksToolItem, horizontalAlignCenterToolItem, horizontalAlignJustifyToolItem, horizontalAlignLeftToolItem, horizontalAlignRightToolItem, indentBlocksToolItem } from 'notebookEditor/shared/toolItem';
import { Toolbar, ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { HeadingLevelToolItem } from './HeadingLevelToolItem';

//*********************************************************************************
// == Tool Items ==================================================================
export const headingLevelToolItem: ToolItem = {
  toolType: 'component',
  name: 'headingLevelToolItem',

  shouldShow: (editor, depth) => depth === 1/*only show on the direct parent node of a TextNode*/,
  component: (props) => <HeadingLevelToolItem {...props}/>,
};

export const headingBackgroundColorToolItem: ToolItem = {
  toolType: 'component',
  name: 'headingBackgroundColorToolItem',

  component: ({ editor, depth }) =>
    <ColorPickerNodeToolItem
      editor={editor}
      depth={depth}
      nodeName={NodeName.HEADING}
      attributeType={AttributeType.BackgroundColor}
      name={'Heading Background Color'}
    />,
};

// == Toolbar =====================================================================
export const HeadingToolbar: Toolbar = {
  title: 'Heading',
  name: NodeName.HEADING/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      headingLevelToolItem,
      orderedListToolItem,
      bulletListToolItem,
      taskListToolItem,
      blockquoteToolItem,
      horizontalRuleToolItem,
      markBold,
      markItalic,
      markUnderline,
      markStrikethrough,
      markSuperScript,
      markSubScript,
      markCode,
      linkToolItem,
      nestedViewBlockNodeToolItem,
      editableInlineNodeWithContentToolItem,
      demo2AsyncNodeToolItem,
      demoAsyncNodeToolItem,
      codeBlockToolItem,
      codeBlockReferenceToolItem,
      imageToolItem,
      horizontalAlignLeftToolItem,
      horizontalAlignCenterToolItem,
      horizontalAlignRightToolItem,
      horizontalAlignJustifyToolItem,
      dedentBlocksToolItem,
      indentBlocksToolItem,
    ],
    [
      headingBackgroundColorToolItem,
      fontSizeToolItem,
      textColorToolItem,
      backgroundColorMarkToolItem,
    ],
    [
      spacingToolItem,
    ],
  ],
};

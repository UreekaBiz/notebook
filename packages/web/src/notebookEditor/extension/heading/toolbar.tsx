import { Editor } from '@tiptap/core';
import { ReactElement } from 'react';
import { BiHeading } from 'react-icons/bi';
import { FaHeading } from 'react-icons/fa';
import { RiHeading } from 'react-icons/ri';

import { AttributeType, HeadingLevel, NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markItalic } from 'notebookEditor/extension/italic/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { markSubScript } from 'notebookEditor/extension/subScript/toolbar';
import { markSuperScript } from 'notebookEditor/extension/superScript/toolbar';
import { fontSizeToolItem, spacingToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { markUnderline } from 'notebookEditor/extension/underline/toolbar';
import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { createDefaultHeadingAttributes } from './type';

//*********************************************************************************
// == Tool Items ==================================================================
// This utility function severs as a generator for HeadingToolItems since they
// share most of the functionality and only differ by the heading level.
const createHeadingTool = (level: HeadingLevel, icon: ReactElement): ToolItem => ({
  toolType: 'button',
  name: `${NodeName.HEADING}${level}`,
  label: `${NodeName.HEADING}${level}`,

  icon,
  tooltip: `Heading ${level} (⌘ + ⌥ + ${level})`,

  shouldShow: (editor, depth) => depth === 1/*only show on the direct parent node of a TextNode*/,
  onClick: (editor) => editor.chain().focus().setHeading(createDefaultHeadingAttributes(level)).run(),
});
export const heading1: ToolItem = createHeadingTool(HeadingLevel.One, <FaHeading size={16} />);
export const heading2: ToolItem = createHeadingTool(HeadingLevel.Two, <RiHeading size={16} />);
export const heading3: ToolItem = createHeadingTool(HeadingLevel.Three, <BiHeading size={16} />);

// == Toolbar =====================================================================
export const HeadingToolbar: Toolbar = {
  title: 'Heading',
  name: NodeName.HEADING/*Expected and guaranteed to be unique*/,

  toolsCollections: [
    [
      markBold,
      markItalic,
      markUnderline,
      markStrikethrough,
      markSuperScript,
      markSubScript,
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

// == Util ========================================================================
export const isHeadingToolActive = (editor: Editor, toolName: string/*in the form of ${HeadingName}{number}*/) => {
  const { selection } = editor.state;

  switch(toolName) {
    case `${NodeName.HEADING}1`:
      return editor.isActive(NodeName.HEADING) && selection.$anchor.parent.attrs[AttributeType.Level] === HeadingLevel.One;
    case `${NodeName.HEADING}2`:
      return editor.isActive(NodeName.HEADING) && selection.$anchor.parent.attrs[AttributeType.Level] === HeadingLevel.Two;
    case `${NodeName.HEADING}3`:
      return editor.isActive(NodeName.HEADING) && selection.$anchor.parent.attrs[AttributeType.Level] === HeadingLevel.Three;
    default:
      return false;
  }
};

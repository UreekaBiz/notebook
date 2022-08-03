import { Editor } from '@tiptap/core';
import { ReactNode } from 'react';
import { BiHeading } from 'react-icons/bi';
import { FaHeading } from 'react-icons/fa';
import { RiHeading } from 'react-icons/ri';

import { HeadingLevel, NodeName } from '@ureeka-notebook/web-service';

import { markBold } from 'notebookEditor/extension/bold/toolbar';
import { markStrikethrough } from 'notebookEditor/extension/strikethrough/toolbar';
import { fontSizeToolItem, spacingToolItem, textColorToolItem } from 'notebookEditor/extension/textStyle/toolbar';
import { Toolbar, ToolItem } from 'notebookEditor/toolbar/type';

import { createDefaultHeadingAttributes } from './type';

//*********************************************************************************
// == Tool Items ==================================================================
// This utility function severs as a generator for HeadingToolItems since they
// share most of the functionality and only differ by the heading level.
const createHeadingTool = (level: HeadingLevel, icon: ReactNode): ToolItem => ({
  toolType: 'button',
  name: `${NodeName.HEADING}${level}`,
  label: `${NodeName.HEADING}${level}`,

  icon,
  tooltip: `Heading${level} (⌘ + ⌥ + ${level})`,

  shouldShow: (editor, depth) => depth === 1/*only show on the direct parent node of a TextNode*/,
  onClick: (editor) => editor.chain().focus().toggleHeading(createDefaultHeadingAttributes(level)).run(),
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
      markStrikethrough,
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
      return editor.isActive(NodeName.HEADING) && selection.$anchor.parent.attrs.level === HeadingLevel.One;
    case `${NodeName.HEADING}2`:
      return editor.isActive(NodeName.HEADING) && selection.$anchor.parent.attrs.level === HeadingLevel.Two;
    case `${NodeName.HEADING}3`:
      return editor.isActive(NodeName.HEADING) && selection.$anchor.parent.attrs.level === HeadingLevel.Three;
    default:
      return false;
  }
};

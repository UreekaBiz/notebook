import { ReactNode } from 'react';
import { AiOutlineVerticalAlignBottom, AiOutlineVerticalAlignMiddle, AiOutlineVerticalAlignTop } from 'react-icons/ai';
import { BiHeading } from 'react-icons/bi';
import { FaHeading } from 'react-icons/fa';
import { RiHeading } from 'react-icons/ri';

import { HeadingLevel, NodeName, VerticalAlign } from '@ureeka-notebook/web-service';

import { createDefaultHeadingAttributes } from 'notebookEditor/extension/heading/type';
import { setVerticalAlign } from 'notebookEditor/shared/command';

import { EditorTool } from './type';

// ********************************************************************************
// ================================================================================
// -- Vertical Align --------------------------------------------------------------
export const verticalAlignTop: EditorTool = {
  toolType: 'button',
  name: `verticalAlign-${VerticalAlign.top}`,
  tooltip: 'Vertical Align - Top',
  icon: <AiOutlineVerticalAlignTop size={16} />,
  label: `verticalAlign-${VerticalAlign.top}`,

  onClick: (editor) => setVerticalAlign(editor, VerticalAlign.top),
};

export const verticalAlignMiddle: EditorTool = {
  toolType: 'button',
  name: `verticalAlign-${VerticalAlign.middle}`,
  tooltip: 'Vertical Align - Middle',
  icon: <AiOutlineVerticalAlignMiddle size={16} />,
  label: `verticalAlign-${VerticalAlign.middle}`,

  onClick: (editor) => setVerticalAlign(editor, VerticalAlign.middle),
};

export const verticalAlignBottom: EditorTool = {
  toolType: 'button',
  name: `verticalAlign-${VerticalAlign.bottom}`,
  tooltip: 'Vertical Align - Bottom',
  icon: <AiOutlineVerticalAlignBottom size={16} />,
  label: `verticalAlign-${VerticalAlign.bottom}`,

  onClick: (editor) => setVerticalAlign(editor, VerticalAlign.bottom),
};

// -- Heading ---------------------------------------------------------------------
const createHeadingTool = (level: HeadingLevel, icon: ReactNode): EditorTool => ({
  toolType: 'button',

  name: `${NodeName.HEADING}${level}`,
  label: `${NodeName.HEADING}${level}`,

  icon,
  tooltip: `Heading${level} (⌘ + ⌥ + ${level})`,

  shouldShow: (editor, depth) => depth === 1,
  onClick: (editor) => editor.chain().focus().toggleHeading(createDefaultHeadingAttributes(level)).run(),
});
export const heading1: EditorTool = createHeadingTool(HeadingLevel.One, <FaHeading size={16} />);
export const heading2: EditorTool = createHeadingTool(HeadingLevel.Two, <RiHeading size={16} />);
export const heading3: EditorTool = createHeadingTool(HeadingLevel.Three, <BiHeading size={16} />);

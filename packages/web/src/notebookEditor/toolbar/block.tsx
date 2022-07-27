import { AiOutlineVerticalAlignBottom, AiOutlineVerticalAlignMiddle, AiOutlineVerticalAlignTop } from 'react-icons/ai';

import { VerticalAlign } from '@ureeka-notebook/web-service';

import { setVerticalAlign } from 'notebookEditor/shared/command';

import { ToolItem } from './type';

// FIXME: figure out where this goes!
// ********************************************************************************
// ================================================================================
// -- Vertical Align --------------------------------------------------------------
export const verticalAlignTop: ToolItem = {
  toolType: 'button',
  name: `verticalAlign-${VerticalAlign.top}`,
  tooltip: 'Vertical Align - Top',
  icon: <AiOutlineVerticalAlignTop size={16} />,
  label: `verticalAlign-${VerticalAlign.top}`,

  onClick: (editor) => setVerticalAlign(editor, VerticalAlign.top),
};

export const verticalAlignMiddle: ToolItem = {
  toolType: 'button',
  name: `verticalAlign-${VerticalAlign.middle}`,
  tooltip: 'Vertical Align - Middle',
  icon: <AiOutlineVerticalAlignMiddle size={16} />,
  label: `verticalAlign-${VerticalAlign.middle}`,

  onClick: (editor) => setVerticalAlign(editor, VerticalAlign.middle),
};

export const verticalAlignBottom: ToolItem = {
  toolType: 'button',
  name: `verticalAlign-${VerticalAlign.bottom}`,
  tooltip: 'Vertical Align - Bottom',
  icon: <AiOutlineVerticalAlignBottom size={16} />,
  label: `verticalAlign-${VerticalAlign.bottom}`,

  onClick: (editor) => setVerticalAlign(editor, VerticalAlign.bottom),
};

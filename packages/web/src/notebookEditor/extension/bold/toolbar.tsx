import { BiBold } from 'react-icons/bi';

import { isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { ToolItem } from 'notebookEditor/toolbar/type';

import { toolItemCommandWrapper } from '../util/command';
import { toggleBoldCommand } from './command';

// ********************************************************************************
// == Tool Items ==================================================================
export const markBold: ToolItem = {
  toolType: 'button',
  name: MarkName.BOLD,
  label: MarkName.BOLD,

  icon: <BiBold size={16} />,
  tooltip: 'Bold (⌘ + B)',

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleBoldCommand),

  isActive: (editor) => {
    if(inMarkHolder(editor, MarkName.BOLD)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.BOLD);
  },
};

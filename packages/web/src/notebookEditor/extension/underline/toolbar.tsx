import { AiOutlineUnderline } from 'react-icons/ai';

import { isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { ToolItem } from 'notebookEditor/toolbar/type';

import { toggleUnderlineCommand } from './command';

// ********************************************************************************
// == Tool Items ==================================================================
export const markUnderline: ToolItem = {
  toolType: 'button',
  name: MarkName.UNDERLINE,
  label: MarkName.UNDERLINE,

  icon: <AiOutlineUnderline size={16} />,
  tooltip: 'Underline (⌘ + U)',

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleUnderlineCommand),

  isActive: (editor) => {
    if(inMarkHolder(editor, MarkName.UNDERLINE)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.UNDERLINE);
  },
};

import { BiStrikethrough } from 'react-icons/bi';

import { isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { shouldShowToolItem } from 'notebookEditor/shared/toolItem';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { toggleStrikethroughCommand } from './command';

// ********************************************************************************
// == Tool Items ==================================================================
export const markStrikethrough: ToolItem = {
  toolType: 'button',
  name: MarkName.STRIKETHROUGH,
  label: MarkName.STRIKETHROUGH,

  icon: <BiStrikethrough size={16} />,
  tooltip: 'Strikethrough (⌘ + ⇧ + X)',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  isActive: (editor) => {
    if(inMarkHolder(editor,  MarkName.STRIKETHROUGH)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.STRIKETHROUGH);
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleStrikethroughCommand),
};

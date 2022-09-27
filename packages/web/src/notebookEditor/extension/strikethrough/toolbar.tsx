import { BiStrikethrough } from 'react-icons/bi';

import { getParentNode, isListItemContentNode, isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { shouldShowToolItemInsideList } from 'notebookEditor/extension//list/util';
import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
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

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => {
    if(isListItemContentNode(getParentNode(editor.state.selection))) {
      return shouldShowToolItemInsideList(editor.state, depth);
    } /* else -- not inside ListItemContent */

    return depth === undefined || editor.state.selection.$anchor.depth === depth;/*direct parent*/
  },
  isActive: (editor) => {
    if(inMarkHolder(editor,  MarkName.STRIKETHROUGH)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.STRIKETHROUGH);
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleStrikethroughCommand),
};

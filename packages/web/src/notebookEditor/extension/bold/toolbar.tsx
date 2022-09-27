import { BiBold } from 'react-icons/bi';

import { getParentNode, isListItemContentNode, isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { shouldShowToolItemInsideList } from 'notebookEditor/extension/list/util';
import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

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
  shouldShow: (editor, depth) => {
    if(isListItemContentNode(getParentNode(editor.state.selection))) {
      return shouldShowToolItemInsideList(editor.state, depth);
    } /* else -- not inside ListItemContent */

    return depth === undefined || editor.state.selection.$anchor.depth === depth;/*direct parent*/
  },
  isActive: (editor) => {
    if(inMarkHolder(editor,  MarkName.BOLD)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.BOLD);
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleBoldCommand),
};

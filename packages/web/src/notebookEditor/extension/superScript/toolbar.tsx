import { MdSuperscript } from 'react-icons/md';

import { getParentNode, isListItemContentNode, isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { shouldShowToolItemInsideList } from 'notebookEditor/extension//list/util';
import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { toggleSuperScriptCommand } from './command';

// ********************************************************************************
// == Tool Items ==================================================================
export const markSuperScript: ToolItem = {
  toolType: 'button',
  name: MarkName.SUPER_SCRIPT,
  label: MarkName.SUPER_SCRIPT,

  icon: <MdSuperscript size={16} />,
  tooltip: 'Superscript (⌘ + .)',

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
    if(inMarkHolder(editor, MarkName.SUPER_SCRIPT)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.SUPER_SCRIPT);
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleSuperScriptCommand),
};

import { AiOutlineItalic } from 'react-icons/ai';

import { getParentNode, isListItemContentNode, isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { shouldShowToolItemInsideList } from 'notebookEditor/extension/list/util';
import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { toggleItalicCommand } from './command';

// ********************************************************************************
// == Tool Items ==================================================================
export const markItalic: ToolItem = {
  toolType: 'button',
  name: MarkName.ITALIC,
  label: MarkName.ITALIC,

  icon: <AiOutlineItalic size={16} />,
  tooltip: 'Italic (⌘ + I)',

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
    if(inMarkHolder(editor, MarkName.ITALIC)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.ITALIC);
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleItalicCommand),
};

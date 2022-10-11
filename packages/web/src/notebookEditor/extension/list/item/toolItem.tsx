import { MdFormatIndentDecrease, MdFormatIndentIncrease } from 'react-icons/md';

import { getParentNode, isListItemContentNode, isNodeSelection } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { dedentListCommand } from '../keyboardShortcut/dedent';
import { indentListCommand } from '../keyboardShortcut/indent';
import { shouldShowToolItemInsideList } from '../util';

// ********************************************************************************
// -- Indentation -----------------------------------------------------------------
export const dedentListToolItem: ToolItem = {
  toolType: 'button',

  name: 'dedentListToolItem',
  label: 'dedentListToolItem',

  icon: <MdFormatIndentDecrease size={16} />,
  tooltip: 'Dedent List (⇧ + ↹)',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => {
    if(isListItemContentNode(getParentNode(editor.state.selection))) {
      return shouldShowToolItemInsideList(editor.state, depth);
    } /* else -- not inside ListItemContent */

    return depth === undefined || editor.state.selection.$anchor.depth === depth;/*direct parent*/
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, dedentListCommand),
};

export const indentListToolItem: ToolItem = {
  toolType: 'button',

  name: 'indentListToolItem',
  label: 'indentListToolItem',

  icon: <MdFormatIndentIncrease size={16} />,
  tooltip: 'Indent List (↹)',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => {
    if(isListItemContentNode(getParentNode(editor.state.selection))) {
      return shouldShowToolItemInsideList(editor.state, depth);
    } /* else -- not inside ListItemContent */

    return depth === undefined || editor.state.selection.$anchor.depth === depth;/*direct parent*/
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, indentListCommand),
};


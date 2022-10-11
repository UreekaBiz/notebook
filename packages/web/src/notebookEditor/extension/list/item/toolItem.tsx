import { MdFormatIndentDecrease, MdFormatIndentIncrease } from 'react-icons/md';

import { isNodeSelection } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { dedentListCommand } from '../keyboardShortcut/dedent';
import { indentListCommand } from '../keyboardShortcut/indent';

// ********************************************************************************
// -- Indentation -----------------------------------------------------------------
export const dedentListToolItem: ToolItem = {
  toolType: 'button',

  name: 'dedentListToolItem',
  label: 'dedentListToolItem',

  icon: <MdFormatIndentDecrease size={16} />,
  tooltip: 'Dedent List (⇧ + ↹)',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, dedentListCommand),
};

export const indentListToolItem: ToolItem = {
  toolType: 'button',

  name: 'indentListToolItem',
  label: 'indentListToolItem',

  icon: <MdFormatIndentIncrease size={16} />,
  tooltip: 'Indent List (↹)',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, indentListCommand),
};


import { MdFormatIndentDecrease, MdFormatIndentIncrease } from 'react-icons/md';

import { isNodeSelection } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { changeBlockIndentationCommand } from './command';

// ********************************************************************************
// -- Indentation -----------------------------------------------------------------
// NOTE: these Commands make us of the applyFirstValidCommand utility checking if
//       since the check must be done to see if the Indentation of a List should
//       be increased, and it should take priority over the visual-only
//       changeBlockIndentationCommand. This logic also applies for the shortcuts,
//       which are located at Document.ts instead of Keymap.ts
//       for similar reasons (SEE: Keymap.ts, Document.ts)
export const dedentBlocksToolItem: ToolItem = {
  toolType: 'button',

  name: 'dedentBlocksToolItem',
  label: 'dedentBlocksToolItem',

  icon: <MdFormatIndentDecrease size={16} />,
  tooltip: 'Decrease Indent (⌘ + [)',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, changeBlockIndentationCommand('dedent')),
};

export const indentBlocksToolItem: ToolItem = {
  toolType: 'button',

  name: 'indentBlocksToolItem',
  label: 'indentBlocksToolItem',

  icon: <MdFormatIndentIncrease size={16} />,
  tooltip: 'Increase Indent (⌘ + ])',

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, changeBlockIndentationCommand('indent')),
};


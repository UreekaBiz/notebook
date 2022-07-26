import { AiOutlineItalic } from 'react-icons/ai';

import { isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { shouldShowToolItem } from 'notebookEditor/shared/toolItem';
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

  shouldBeDisabled: (editor) => isNodeSelection(editor.state.selection),
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  isActive: (editor) => {
    if(inMarkHolder(editor, MarkName.ITALIC)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.ITALIC);
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleItalicCommand),
};

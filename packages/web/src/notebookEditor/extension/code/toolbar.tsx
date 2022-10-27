import { BsCodeSlash } from 'react-icons/bs';

import { isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { shouldShowToolItem } from 'notebookEditor/shared/toolItem';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { toggleCodeCommand } from './command';

// ********************************************************************************
// == Tool Items ==================================================================
export const markCode: ToolItem = {
  toolType: 'button',
  name: MarkName.CODE,
  label: MarkName.CODE,

  icon: <BsCodeSlash size={16} />,
  tooltip: 'Code (⌘ + E)',

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  isActive: (editor) => {
    if(inMarkHolder(editor, MarkName.CODE)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.CODE);
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleCodeCommand),
};

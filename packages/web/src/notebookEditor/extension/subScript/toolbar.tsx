import { MdSubscript } from 'react-icons/md';

import { isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { inMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { shouldShowToolItem } from 'notebookEditor/shared/toolItem';
import { ToolItem } from 'notebookEditor/sidebar/toolbar/type';

import { toggleSubScriptCommand } from './command';

// ********************************************************************************
// == Tool Items ==================================================================
export const markSubScript: ToolItem = {
  toolType: 'button',
  name: MarkName.SUB_SCRIPT,
  label: MarkName.SUB_SCRIPT,

  icon: <MdSubscript size={16} />,
  tooltip: 'Subscript (⌘ + ,)',

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => shouldShowToolItem(editor, depth),
  isActive: (editor) => {
    if(inMarkHolder(editor, MarkName.SUB_SCRIPT)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.SUB_SCRIPT);
  },
  onClick: (editor, depth) => toolItemCommandWrapper(editor, depth, toggleSubScriptCommand),
};

import { BiBold } from 'react-icons/bi';

import { isHeadingNode, isParagraphNode, MarkName } from '@ureeka-notebook/web-service';

import { isNodeSelection } from 'notebookEditor/extension/util/node';
import { ToolItem } from 'notebookEditor/toolbar/type';

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
    if(isNodeSelection(selection)) return true;
    if(isParagraphNode(selection.$anchor.parent) || isHeadingNode(selection.$anchor.parent)) return false;
    /* else -- selection somewhere that does not allow bold */

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor) => editor.chain().focus().toggleBold().run(),
};

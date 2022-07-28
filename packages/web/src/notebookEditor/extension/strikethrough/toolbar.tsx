import { BiStrikethrough } from 'react-icons/bi';

import { isHeadingNode, isParagraphNode, MarkName } from '@ureeka-notebook/web-service';

import { isNodeSelection } from 'notebookEditor/extension/util/node';
import { ToolItem } from 'notebookEditor/toolbar/type';

// ********************************************************************************
// == Tool Items ==================================================================
export const markStrikethrough: ToolItem = {
  toolType: 'button',
  name: MarkName.STRIKETHROUGH,
  label: MarkName.STRIKETHROUGH,

  icon: <BiStrikethrough size={16} />,
  tooltip: 'Strikethrough (⌘ + Shift + X)',

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(isNodeSelection(selection)) return true;
    if(isParagraphNode(selection.$anchor.parent) || isHeadingNode(selection.$anchor.parent)) return false;
    /* else -- selection somewhere that does not allow strikethrough */

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor) => editor.chain().focus().toggleStrikethrough().run(),
};

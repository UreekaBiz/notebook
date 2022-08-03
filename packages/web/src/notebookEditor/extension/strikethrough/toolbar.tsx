import { BiStrikethrough } from 'react-icons/bi';

import { getStrikethroughMarkType, isStrikethroughMark, MarkName } from '@ureeka-notebook/service-common';

import { toggleMarkInMarkHolder, getMarkHolder } from 'notebookEditor/extension/markHolder/util';
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
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor) => {
    // if MarkHolder is defined toggle the Mark inside it
    const markHolder = getMarkHolder(editor);
    if(markHolder) return toggleMarkInMarkHolder(editor.state.selection, () => editor.chain(), markHolder, getStrikethroughMarkType(editor.schema))/*nothing else to do*/;
    /* else -- MarkHolder is not present */

    return editor.chain().focus().toggleStrikethrough().run();
  },

  isActive: (editor) => {
    const markHolder = getMarkHolder(editor);
    if(markHolder && markHolder.attrs.storedMarks?.some(mark => isStrikethroughMark(mark))) return true/*is active*/;

    return editor.isActive(MarkName.STRIKETHROUGH);
  },
};

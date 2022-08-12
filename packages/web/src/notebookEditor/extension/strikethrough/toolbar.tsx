import { BiStrikethrough } from 'react-icons/bi';

import { getStrikethroughMarkType, isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { getMarkHolder, inMarkHolder, toggleMarkInMarkHolder } from 'notebookEditor/extension/markHolder/util';
import { ToolItem } from 'notebookEditor/toolbar/type';

// ********************************************************************************
// == Tool Items ==================================================================
export const markStrikethrough: ToolItem = {
  toolType: 'button',
  name: MarkName.STRIKETHROUGH,
  label: MarkName.STRIKETHROUGH,

  icon: <BiStrikethrough size={16} />,
  tooltip: 'Strikethrough (⌘ + ⇧ + X)',

  shouldBeDisabled: (editor) => {
    const { selection } = editor.state;
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor) => {
    // if MarkHolder is defined toggle the Mark inside it
    const markHolder = getMarkHolder(editor);
    if(markHolder) return toggleMarkInMarkHolder(editor, () => editor.chain()/*(SEE: toggleInMarkHolder)*/, markHolder, getStrikethroughMarkType(editor.schema))/*nothing else to do*/;
    /* else -- MarkHolder is not present */

    return editor.chain().focus().toggleStrikethrough().run();
  },

  isActive: (editor) => {
    if(inMarkHolder(editor,  MarkName.STRIKETHROUGH)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.STRIKETHROUGH);
  },
};

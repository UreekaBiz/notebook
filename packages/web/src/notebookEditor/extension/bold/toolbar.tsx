import { BiBold } from 'react-icons/bi';

import { getBoldMarkType, isBoldMark, MarkName } from '@ureeka-notebook/service-common';

import { toggleMarkInMarkHolder, getMarkHolder } from 'notebookEditor/extension/markHolder/util';
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
    if(!isNodeSelection(selection)) return false;

    return true;
  },
  shouldShow: (editor, depth) => depth === undefined || editor.state.selection.$anchor.depth === depth/*direct parent*/,
  onClick: (editor) => {
    // if MarkHolder is defined toggle the Mark inside it
    const markHolder = getMarkHolder(editor);

    if(markHolder) return toggleMarkInMarkHolder(editor.state.selection, editor.chain, markHolder, getBoldMarkType(editor.schema))/*nothing else to do*/;
    return editor.chain().focus().toggleBold().run();
  },

  isActive: (editor) => {
    const markHolder = getMarkHolder(editor);
    if(markHolder && markHolder.attrs.storedMarks?.some(mark => isBoldMark(mark))) return true/*is active*/;

    return editor.isActive(MarkName.BOLD);
  },
};

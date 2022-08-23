import { BiBold } from 'react-icons/bi';

import { getBoldMarkType, isNodeSelection, MarkName } from '@ureeka-notebook/web-service';

import { getMarkHolder, inMarkHolder, toggleMarkInMarkHolder } from 'notebookEditor/extension/markHolder/util';
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

    if(markHolder) return toggleMarkInMarkHolder(editor, editor.chain/*(SEE: toggleInMarkHolder)*/, markHolder, getBoldMarkType(editor.schema))/*nothing else to do*/;
    return editor.chain().focus().toggleBold().run();
  },

  isActive: (editor) => {
    if(inMarkHolder(editor, MarkName.BOLD)) return true/*is active in MarkHolder*/;

    return editor.isActive(MarkName.BOLD);
  },
};

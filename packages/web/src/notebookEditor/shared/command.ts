import { Editor } from '@tiptap/core';

import { VerticalAlign } from '@ureeka-notebook/web-service';

import { isNodeSelection } from 'notebookEditor/extension/util/node';

// ********************************************************************************
/**
 * Sets the vertical alignment attribute for a node if it is not currently bottom,
 * or sets it to 'bottom' if the desiredAlignment is the same it already has
 *
 * @param editor The current editor instance
 * @param desiredAlignment The alignment that will be set given the checks the function performs
 * @returns A boolean indicating whether the attribute update was successful or not
 */
export const setVerticalAlign = (editor: Editor, desiredAlignment: VerticalAlign): boolean => {
  const { selection } = editor.state;
  const nodePos = selection.$anchor.pos;

  /*case 1: vertical align must be changed from something other than bottom to bottom*/
  if(isNodeSelection(selection)) {
    const nodeName = selection.node.type.name;
    if(selection.node.attrs.verticalAlign === desiredAlignment) {
      const nodeName = selection.node.type.name;
      return editor.chain().updateAttributes(nodeName, { verticalAlign: VerticalAlign.bottom }).setNodeSelection(nodePos).run();
    }
    /*case 2: vertical align must be changed from something other than bottom to something other than bottom*/
    else
      return editor.chain().updateAttributes(nodeName, { verticalAlign: desiredAlignment }).setNodeSelection(nodePos).run();
  }
  /* else -- not a node selection */

  return false;
};

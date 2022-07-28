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
 * @returns `true` if attribute update was successful. `false` otherwise
 */
export const setVerticalAlign = (editor: Editor, desiredAlignment: VerticalAlign): boolean => {
  const { selection } = editor.state;
  const nodePos = selection.$anchor.pos;
  if(!isNodeSelection(selection)) return false/*do not handle*/;

  const { name: nodeName } = selection.node.type,
        shouldSetBottom = selection.node.attrs.verticalAlign === desiredAlignment;

  return editor.chain()
                .updateAttributes(nodeName, { verticalAlign: shouldSetBottom ? VerticalAlign.bottom : desiredAlignment })
                .setNodeSelection(nodePos)
                .run();
};

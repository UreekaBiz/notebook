import { Editor } from '@tiptap/core';

import { createImageNode, isNodeSelection, replaceAndSelectNodeCommand, AttributeType, Command, ImageAttributes, VerticalAlign } from '@ureeka-notebook/web-service';

// ================================================================================
// creates and selects an Image Node by replacing whatever is at the current
// selection with the newly created Image Node
export const insertAndSelectImageCommand = (attrs: Partial<ImageAttributes>): Command => (state, dispatch) => {
  const image = createImageNode(state.schema, attrs);
  return replaceAndSelectNodeCommand(image)(state, dispatch);
};

// == Util ========================================================================
// sets the vertical alignment Attribute for a Node if it is not currently bottom,
// or sets it to 'bottom' if the desiredAlignment is the same it already has
// NOTE: currently only this branch uses this Command
export const setVerticalAlign = (editor: Editor, desiredAlignment: VerticalAlign): boolean => {
  const { selection } = editor.state;
  const nodePos = selection.anchor;
  if(!isNodeSelection(selection)) return false/*do not handle*/;

  const { name: nodeName } = selection.node.type,
        shouldSetBottom = selection.node.attrs[AttributeType.VerticalAlign] === desiredAlignment;

  return editor.chain()
                .updateAttributes(nodeName, { verticalAlign: shouldSetBottom ? VerticalAlign.bottom : desiredAlignment })
                .setNodeSelection(nodePos)
                .run();
};

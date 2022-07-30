import { CommandProps, Editor } from '@tiptap/core';

import { CommandFunctionType, ImageAttributes, ImageNodeType, NotebookSchemaType, NodeName, VerticalAlign } from '@ureeka-notebook/web-service';

import { isNodeSelection, replaceAndSelectNode } from 'notebookEditor/extension/util/node';

// ********************************************************************************
// == Type ========================================================================
// NOTE: ambient module to ensure command is TypeScript-registered for TipTap
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    [NodeName.IMAGE/*Expected and guaranteed to be unique. (SEE: /notebookEditor/model/node)*/]: {
      /** Add an Image Node. If the attributes are not given, defaults will be used */
      insertImage: CommandFunctionType<typeof insertAndSelectImageCommand, ReturnType>;
    };
  }
}

// == Implementation ==============================================================
// .. Create ......................................................................
const createImageNode = (schema: NotebookSchemaType, attributes: Partial<ImageAttributes>): ImageNodeType =>
  schema.nodes.image.create(attributes) as ImageNodeType/*by definition*/;

// creates and selects an Image Node by replacing whatever is at the current
// selection with the newly created Image Node
export const insertAndSelectImageCommand = (attrs: Partial<ImageAttributes> = {}) => (props: CommandProps) => {
  const image = createImageNode(props.editor.schema, attrs);
  return replaceAndSelectNode(image, props.tr, props.dispatch);
};

// == Util ========================================================================
// sets the vertical alignment Attribute for a Node if it is not currently bottom,
// or sets it to 'bottom' if the desiredAlignment is the same it already has
// NOTE: currently only this branch uses this Command
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

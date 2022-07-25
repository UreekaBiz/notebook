import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { NodeRendererSpec } from '../htmlRenderer/type';
import { NodeName, NodeType } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// -- Node Spec -------------------------------------------------------------------
export const TextNodeSpec: NodeSpec = {
  name: NodeName.TEXT,

  group: NodeType.INLINE,
};

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type TextNodeType = ProseMirrorNode<NotebookSchemaType> & {/*nothing additional*/};
export const isTextNode = (node: ProseMirrorNode<NotebookSchemaType>): node is TextNodeType => node.type.name === NodeName.TEXT;

// ================================================================================
// -- Render Spec -----------------------------------------------------------------
// TODO: Add TextAttributes
export const TextNodeRendererSpec: NodeRendererSpec = {
  tag: 'span',

  attributes: {/*no attributes*/},
};

import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { NodeRendererSpec } from '../htmlRenderer/type';
import { JSONNode, NodeGroup, NodeName } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
export type TextAttributes = {/*no attributes*/};

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const TextNodeSpec: NodeSpec = {
  name: NodeName.TEXT/*expected and guaranteed to be unique*/,

  group: NodeGroup.INLINE,
};

// -- Render Spec -----------------------------------------------------------------
export const TextNodeRendererSpec: NodeRendererSpec = {
  tag: 'span',

  attributes: {/*no Attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type TextNodeType = ProseMirrorNode<NotebookSchemaType> & {/*nothing additional*/};
export const isTextNode = (node: ProseMirrorNode<NotebookSchemaType>): node is TextNodeType => node.type.name === NodeName.TEXT;

// -- JSON Node Type --------------------------------------------------------------
export type TextJSONNodeType = JSONNode<TextAttributes> & { type: NodeName.TEXT; };
export const isTextJSONNode = (node: JSONNode): node is TextJSONNodeType => node.type === NodeName.TEXT;

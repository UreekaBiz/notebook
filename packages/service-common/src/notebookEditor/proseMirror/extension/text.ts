import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { JSONNode, NodeGroup, NodeName } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const TextAttributesSpec = {/*no attributes*/};
export type TextAttributes = AttributesTypeFromNodeSpecAttributes<typeof TextAttributesSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const TextNodeSpec: NodeSpec = {
  name: NodeName.TEXT/*expected and guaranteed to be unique*/,

  group: NodeGroup.INLINE,
  marks: '_'/*all marks allowed*/,

  attrs: TextAttributesSpec,
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

export const getTextNodeType = (schema: NotebookSchemaType) => schema.marks[NodeName.TEXT];
export const createTextNode = (schema: NotebookSchemaType, text: string, marks?: Mark<NotebookSchemaType>[]) => schema.text(text, marks);

// -- JSON Node Type --------------------------------------------------------------
export type TextJSONNodeType = JSONNode<TextAttributes> & { type: NodeName.TEXT; };
export const isTextJSONNode = (node: JSONNode): node is TextJSONNodeType => node.type === NodeName.TEXT;

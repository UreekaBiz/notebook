import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { JSONNode, NodeGroup, NodeName } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Extension.
const ParagraphAttributesSpec = {
  [AttributeType.FontSize]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.TextColor]: noNodeSpecAttributeDefaultValue<string>(),

  [AttributeType.PaddingTop]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingBottom]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingLeft]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingRight]: noNodeSpecAttributeDefaultValue<string>(),

  [AttributeType.MarginTop]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginBottom]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginLeft]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginRight]: noNodeSpecAttributeDefaultValue<string>(),
};
export type ParagraphAttributes = AttributesTypeFromNodeSpecAttributes<typeof ParagraphAttributesSpec>

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const ParagraphNodeSpec: Readonly<NodeSpec> = {
  name: NodeName.PARAGRAPH/*expected and guaranteed to be unique*/,

  group: NodeGroup.BLOCK,
  content: `${NodeGroup.INLINE}*`,

  attrs: ParagraphAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const ParagraphNodeRendererSpec: NodeRendererSpec<ParagraphAttributes> = {
  tag: 'div',

  attributes: {/*use the default renderer on all attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type ParagraphNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: ParagraphAttributes; };
export const isParagraphNode = (node: ProseMirrorNode<NotebookSchemaType>): node is ParagraphNodeType => node.type.name === NodeName.PARAGRAPH;

// -- JSON Node Type --------------------------------------------------------------
export type ParagraphJSONNodeType = JSONNode<ParagraphAttributes> & { type: NodeName.PARAGRAPH; };
export const isParagraphJSONNode = (node: JSONNode): node is ParagraphJSONNodeType => node.type === NodeName.PARAGRAPH;

import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { NodeName, NodeType } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// -- Attribute -------------------------------------------------------------------
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

// ================================================================================
// -- Node Spec -------------------------------------------------------------------
export const ParagraphNodeSpec: Readonly<NodeSpec> = {
  name: NodeName.PARAGRAPH,

  group: NodeType.BLOCK,
  content: `${NodeType.INLINE}*`,

  attrs: ParagraphAttributesSpec,
};

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type ParagraphNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: ParagraphAttributes; };
export const isParagraphNode = (node: ProseMirrorNode<NotebookSchemaType>): node is ParagraphNodeType => node.type.name === NodeName.PARAGRAPH;

// ================================================================================
// -- Render Spec -----------------------------------------------------------------
export const ParagraphNodeRendererSpec: NodeRendererSpec<ParagraphAttributes> = {
  tag: 'div',

  attributes: {/*use the default renderer on all attributes*/},
};

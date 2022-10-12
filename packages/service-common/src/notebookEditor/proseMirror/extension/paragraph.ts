import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes, TextAlign } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { getAllowedMarks, MarkName } from '../mark';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const ParagraphAttributesSpec = {
  [AttributeType.FontSize]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.Color]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.PaddingTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.MarginTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.TextAlign]: noNodeOrMarkSpecAttributeDefaultValue<TextAlign>(),
};
export type ParagraphAttributes = AttributesTypeFromNodeSpecAttributes<typeof ParagraphAttributesSpec>

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const ParagraphNodeSpec: Readonly<NodeSpec> = {
  name: NodeName.PARAGRAPH/*expected and guaranteed to be unique*/,

  content: `${NodeGroup.INLINE}*`,
  marks: getAllowedMarks([MarkName.BOLD, MarkName.CODE, MarkName.ITALIC, MarkName.LINK, MarkName.STRIKETHROUGH, MarkName.SUB_SCRIPT, MarkName.SUPER_SCRIPT, MarkName.TEXT_STYLE, MarkName.UNDERLINE]),

  group: NodeGroup.BLOCK,

  attrs: ParagraphAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const ParagraphNodeRendererSpec: NodeRendererSpec<ParagraphAttributes> = {
  tag: 'div',

  attributes: {/*use the default renderer on all Attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type ParagraphNodeType = ProseMirrorNode & { attrs: ParagraphAttributes; };
export const isParagraphNode = (node: ProseMirrorNode): node is ParagraphNodeType => node.type.name === NodeName.PARAGRAPH;

export const getParagraphNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.PARAGRAPH];
export const createParagraphNode = (schema: NotebookSchemaType, attributes?: Partial<ParagraphAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getParagraphNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type ParagraphJSONNodeType = JSONNode<ParagraphAttributes> & { type: NodeName.PARAGRAPH; };
export const isParagraphJSONNode = (node: JSONNode): node is ParagraphJSONNodeType => node.type === NodeName.PARAGRAPH;

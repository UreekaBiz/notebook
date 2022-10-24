import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { getAllowedMarks, MarkName } from '../mark';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const BlockquoteAttributeSpec = {
  [AttributeType.BorderLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.BorderColor]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type BlockquoteAttributes = AttributesTypeFromNodeSpecAttributes<typeof BlockquoteAttributeSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const BlockquoteNodeSpec: NodeSpec = {
  name: NodeName.BLOCKQUOTE,

  content: `${NodeGroup.INLINE}*`,
  marks: getAllowedMarks([MarkName.BOLD, MarkName.CODE, MarkName.ITALIC, MarkName.STRIKETHROUGH, MarkName.SUB_SCRIPT, MarkName.SUPER_SCRIPT, MarkName.TEXT_STYLE, MarkName.UNDERLINE]),

  group: `${NodeGroup.BLOCK}`,
  selectable: false/*cannot be set as NodeSelection*/,

  defining: true/*(SEE: https://prosemirror.net/docs/ref/#model.NodeSpec.defining)*/,
  whitespace: 'pre'/*preserve newlines*/,

  attrs: BlockquoteAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const BlockquoteNodeRendererSpec: NodeRendererSpec<BlockquoteAttributes> = {
  tag: 'blockquote',

  attributes: {/*use the default renderer on all Attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type BlockquoteNodeType = ProseMirrorNode & { attrs: BlockquoteAttributes; };
export const isBlockquoteNode = (node: ProseMirrorNode): node is BlockquoteNodeType => node.type.name === NodeName.BLOCKQUOTE;

export const getBlockquoteNode = (schema: NotebookSchemaType) => schema.nodes[NodeName.BLOCKQUOTE];
export const createBlockquoteNode = (schema: NotebookSchemaType, attributes?: Partial<BlockquoteAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getBlockquoteNode(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type BlockquoteJSONNodeType = JSONNode<BlockquoteAttributes> & { type: NodeName.BLOCKQUOTE; };
export const isBlockquoteJSONNode = (node: JSONNode): node is BlockquoteJSONNodeType => node.type === NodeName.BLOCKQUOTE;

// --------------------------------------------------------------------------------
export const DEFAULT_BLOCKQUOTE_BORDER_LEFT_COLOR = '#CCCCCC'/*gray*/;
export const DEFAULT_BLOCKQUOTE_BORDER_LEFT_WIDTH = '3px'/*T&E*/;

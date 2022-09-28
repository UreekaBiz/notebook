import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../../attribute';
import { NodeRendererSpec } from '../../htmlRenderer/type';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../../node';
import { NotebookSchemaType } from '../../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const ListItemContentAttributeSpec = {/*currently no attrs*/};
export type ListItemContentAttributes = AttributesTypeFromNodeSpecAttributes<typeof ListItemContentAttributeSpec>

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const ListItemContentNodeSpec: Readonly<NodeSpec> = {
  name: NodeName.LIST_ITEM_CONTENT/*expected and guaranteed to be unique*/,

  content: `${NodeGroup.INLINE}*`,

  group: NodeGroup.BLOCK,

  attrs: ListItemContentAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const ListItemContentNodeRendererSpec: NodeRendererSpec<ListItemContentAttributes> = {
  tag: 'div',

  attributes: {/*use the default renderer on all Attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type ListItemContentNodeType = ProseMirrorNode & { attrs: ListItemContentAttributes; };
export const isListItemContentNode = (node: ProseMirrorNode): node is ListItemContentNodeType => node.type.name === NodeName.LIST_ITEM_CONTENT;

export const getListItemContentNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.LIST_ITEM_CONTENT];
export const createListItemContentNode = (schema: NotebookSchemaType, attributes?: Partial<ListItemContentAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getListItemContentNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type ListItemContentJSONNodeType = JSONNode<ListItemContentAttributes> & { type: NodeName.LIST_ITEM_CONTENT; };
export const isListItemContentJSONNode = (node: JSONNode): node is ListItemContentJSONNodeType => node.type === NodeName.LIST_ITEM_CONTENT;

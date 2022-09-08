import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributesTypeFromNodeSpecAttributes, AttributeType } from '../../attribute';
import { NodeRendererSpec } from '../../htmlRenderer/type';
import { JSONNode, NodeName, NodeGroup, ProseMirrorNodeContent } from '../../node';
import { NotebookSchemaType } from '../../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Extension.
const OrderedListAttributeSpec = {
  // NOTE: Must be named 'start' since thats the name of the 'ol' HTML tag attribute
  [AttributeType.StartValue]: noNodeOrMarkSpecAttributeDefaultValue<number>(),
};
export type OrderedListAttributes = AttributesTypeFromNodeSpecAttributes<typeof OrderedListAttributeSpec>

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const OrderedListNodeSpec: Readonly<NodeSpec> = {
  name: NodeName.ORDERED_LIST/*expected and guaranteed to be unique*/,

  group: `${NodeGroup.BLOCK} ${NodeGroup.LIST}`,
  content: `${NodeName.LIST_ITEM}+`,

  attrs: OrderedListAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const OrderedListNodeRendererSpec: NodeRendererSpec<OrderedListAttributes> = {
  tag: 'ol',

  attributes: {/*use the default renderer on all attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type OrderedListNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: OrderedListAttributes; };
export const isOrderedListNode = (node: ProseMirrorNode<NotebookSchemaType>): node is OrderedListNodeType => node.type.name === NodeName.ORDERED_LIST;

export const getOrderedListNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.ORDERED_LIST];
export const createOrderedListNode = (schema: NotebookSchemaType, attributes?: Partial<OrderedListAttributes>, content?: ProseMirrorNodeContent, marks?: Mark<NotebookSchemaType>[]) =>
  getOrderedListNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type OrderedListJSONNodeType = JSONNode<OrderedListAttributes> & { type: NodeName.ORDERED_LIST; };
export const isOrderedListJSONNode = (node: JSONNode): node is OrderedListJSONNodeType => node.type === NodeName.ORDERED_LIST;

// == Constant ====================================================================
export const ORDERED_LIST_DEFAULT_START = 1/*number shown to the left of list*/;

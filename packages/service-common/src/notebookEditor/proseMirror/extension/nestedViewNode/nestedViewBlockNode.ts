import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../../attribute';
import { NodeRendererSpec } from '../../htmlRenderer/type';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../../node';
import { NotebookSchemaType } from '../../schema';
import { createNestedViewNodeRenderedView, NestedViewNodeNodeAttributeSpec } from './nestedViewNode';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: This values must have matching types the ones defined in the Extension
const NestedViewBlockNodeAttributeSpec = { ...NestedViewNodeNodeAttributeSpec };
export type NestedViewBlockNodeAttributes = AttributesTypeFromNodeSpecAttributes<typeof NestedViewBlockNodeAttributeSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const NestedViewBlockNodeSpec: NodeSpec = {
  name: NodeName.NESTED_VIEW_BLOCK_NODE,

  atom: true/*this Node counts as a single unit within the View*/,
  code: true/*this Node's content should be treated as code*/,

  // EINwC's that are pasted or put inside the NVBN will be turned into Text Nodes
  content: `(${NodeName.TEXT}|${NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT})*`,

  draggable: false,
  group: NodeGroup.BLOCK,
  marks: '_'/*all marks allowed*/,
  selectable: true/*this Node can be set as a NodeSelection*/,

  attrs: NestedViewBlockNodeAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
const renderNestedViewBlockNodeNodeView = (attributes: NestedViewBlockNodeAttributes, content: string) =>
  createNestedViewNodeRenderedView(NodeName.NESTED_VIEW_BLOCK_NODE, content);

export const NestedViewBlockNodeRendererSpec: NodeRendererSpec<NestedViewBlockNodeAttributes> = {
  tag: 'div',

  isNodeViewRenderer: true/*by definition*/,
  renderNodeView: renderNestedViewBlockNodeNodeView,
  attributes: {/*no need to render attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type NestedViewBlockNodeType = ProseMirrorNode & { attrs: NestedViewBlockNodeAttributes; };
export const isNestedViewBlockNode = (node: ProseMirrorNode): node is NestedViewBlockNodeType => node.type.name === NodeName.NESTED_VIEW_BLOCK_NODE;

export const getNestedViewBlockNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.NESTED_VIEW_BLOCK_NODE];
export const createNestedViewBlockNode = (schema: NotebookSchemaType, attributes?: Partial<NestedViewBlockNodeAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getNestedViewBlockNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type NestedViewBlockNodeJSONNodeType = JSONNode<NestedViewBlockNodeAttributes> & { type: NodeName.NESTED_VIEW_BLOCK_NODE; };
export const isNestedViewBlockNodeJSONNode = (node: JSONNode): node is NestedViewBlockNodeJSONNodeType => node.type === NodeName.NESTED_VIEW_BLOCK_NODE;

// == Util ========================================================================
// .. CSS .........................................................................
export const EMPTY_NESTED_VIEW_BLOCK_NODE_CLASS = 'emptyNVBN';

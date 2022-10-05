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
const EditableInlineNodeWithContentContentNodeAttributeSpec = { ...NestedViewNodeNodeAttributeSpec };
export type EditableInlineNodeWithContentAttributes = AttributesTypeFromNodeSpecAttributes<typeof EditableInlineNodeWithContentContentNodeAttributeSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const EditableInlineNodeWithContentNodeSpec: NodeSpec = {
  name: NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT,

  atom: true/*this Node counts as a single unit within the View*/,
  content: `${NodeName.TEXT}*`,
  draggable: false,
  group: NodeGroup.INLINE,
  inline: true,
  marks: '_'/*all marks allowed*/,

  attrs: EditableInlineNodeWithContentContentNodeAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
const renderEditableInlineNodeWithContentNodeView = (attributes: EditableInlineNodeWithContentAttributes, content: string) =>
  createNestedViewNodeRenderedView(NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT, content);

export const EditableInlineNodeWithContentNodeRendererSpec: NodeRendererSpec<EditableInlineNodeWithContentAttributes> = {
  tag: 'span',

  isNodeViewRenderer: true/*by definition*/,
  renderNodeView: renderEditableInlineNodeWithContentNodeView,
  attributes: {/*no need to render attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type EditableInlineNodeWithContentNodeType = ProseMirrorNode & { attrs: EditableInlineNodeWithContentAttributes; };
export const isEditableInlineNodeWithContentNode = (node: ProseMirrorNode): node is EditableInlineNodeWithContentNodeType => node.type.name === NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT;

export const getEditableInlineNodeWithContentNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT];
export const createEditableInlineNodeWithContent = (schema: NotebookSchemaType, attributes?: Partial<EditableInlineNodeWithContentAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getEditableInlineNodeWithContentNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type EditableInlineNodeWithContentJSONNodeType = JSONNode<EditableInlineNodeWithContentAttributes> & { type: NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT; };
export const isEditableInlineNodeWithContentJSONNode = (node: JSONNode): node is EditableInlineNodeWithContentJSONNodeType => node.type === NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT;

// == Util ========================================================================
// .. Attribute ...................................................................
export const DEFAULT_EDITABLE_INLINE_NODE_WITH_CONTENT_TEXT = 'Default EINwC Text';

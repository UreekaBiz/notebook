import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { JSONNode, NodeName, ProseMirrorNodeContent } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// ================================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const ImageAttributeSpec = {
  [AttributeType.Src]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.Alt]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.Title]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.Width]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.Height]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.TextAlign]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.VerticalAlign]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type ImageAttributes = AttributesTypeFromNodeSpecAttributes<typeof ImageAttributeSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const ImageNodeSpec: NodeSpec = {
  name: NodeName.IMAGE,

  group: 'inline',
  inline: true,
  draggable: true,

  attrs: ImageAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const ImageNodeRendererSpec: NodeRendererSpec<ImageAttributes> = {
  tag: 'img',

  attributes: {/*use the default renderer on all Attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type ImageNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: ImageAttributes; };
export const isImageNode = (node: ProseMirrorNode<NotebookSchemaType>): node is ImageNodeType => node.type.name === NodeName.IMAGE;

export const getImageNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.IMAGE];
export const createImageNode = (schema: NotebookSchemaType, attributes?: ImageAttributes, content?: ProseMirrorNodeContent, marks?: Mark<NotebookSchemaType>[]) =>
  getImageNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type ImageJSONNodeType = JSONNode<ImageAttributes> & { type: NodeName.IMAGE; };
export const isImageJSONNode = (node: JSONNode): node is ImageJSONNodeType => node.type === NodeName.IMAGE;

// --------------------------------------------------------------------------------
export const DEFAULT_IMAGE_SRC = 'https://via.placeholder.com/300.png/09f/fff';
export const DEFAULT_PARSE_IMAGE_TAG = 'img[src]';

// NOTE: exported limits are used in ToolItems to enforce that they do not get exceeded
// SEE: ImageWidthToolItem.tsx, ImageHeightToolItem.tsx
export const MIN_IMAGE_WIDTH = 5/*px*/;
export const MIN_IMAGE_HEIGHT = 5/*px*/;
export const MAX_IMAGE_WIDTH = 500/*px*/;
export const MAX_IMAGE_HEIGHT = 500/*px*/;

// == Util ========================================================================
export const DefaultImageAttributes: Partial<ImageAttributes> = {
  [AttributeType.Width]: '300px',
  [AttributeType.Height]: '300px',
};

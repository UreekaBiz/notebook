import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes, BorderStyle } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { getAllowedMarks } from '../mark';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const ImageAttributeSpec = {
  [AttributeType.Id]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.Uploaded]: noNodeOrMarkSpecAttributeDefaultValue<boolean>(),

  [AttributeType.Src]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.Alt]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.Title]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.BorderColor]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.BorderStyle]: noNodeOrMarkSpecAttributeDefaultValue<BorderStyle>(),
  [AttributeType.BorderWidth]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
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

  marks: getAllowedMarks([/*no Marks allowed for MarkHolder Node*/]),

  group: NodeGroup.INLINE,
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
export type ImageNodeType = ProseMirrorNode & { attrs: ImageAttributes; };
export const isImageNode = (node: ProseMirrorNode): node is ImageNodeType => node.type.name === NodeName.IMAGE;

export const getImageNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.IMAGE];
export const createImageNode = (schema: NotebookSchemaType, attributes?: Partial<ImageAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getImageNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type ImageJSONNodeType = JSONNode<ImageAttributes> & { type: NodeName.IMAGE; };
export const isImageJSONNode = (node: JSONNode): node is ImageJSONNodeType => node.type === NodeName.IMAGE;

// --------------------------------------------------------------------------------
export const DEFAULT_IMAGE_BORDER_COLOR = 'transparent';
export const DEFAULT_IMAGE_BORDER_STYLE = BorderStyle.solid;
export const DEFAULT_IMAGE_BORDER_WIDTH = '1px';

// the class of the fallback container that gets shown while the Image is
// being uploaded, or if the Upload errors out
export const DEFAULT_IMAGE_CONTAINER_CLASS = 'defaultImageContainer'/*NOTE: must match index.css*/;
export const DEFAULT_IMAGE_ERROR_SRC = 'defaultImageErrorSrc';
export const DEFAULT_IMAGE_HEIGHT = '100px';

// NOTE: exported limits are used in ToolItems to enforce that they do not get exceeded
// SEE: ImageWidthToolItem.tsx, ImageHeightToolItem.tsx
export const DEFAULT_IMAGE_MAX_HEIGHT = 500/*px*/;
export const DEFAULT_IMAGE_MAX_WIDTH = 500/*px*/;
export const DEFAULT_IMAGE_MIN_HEIGHT = 5/*px*/;
export const DEFAULT_IMAGE_MIN_WIDTH = 5/*px*/;
export const DEFAULT_IMAGE_SRC = 'defaultImageSrc';
export const DEFAULT_IMAGE_PARSE_TAG = 'img[src]';
export const DEFAULT_IMAGE_WIDTH = '100px';

// == Util ========================================================================
export const defaultImageAttributes: Partial<ImageAttributes> = {
  // NOTE: Images built from the default attributes should not be uploaded
  //       since they are already hosted somewhere else (SEE: ImageDialog.tsx)
  [AttributeType.Uploaded]: true,

  [AttributeType.Width]: DEFAULT_IMAGE_WIDTH,
  [AttributeType.Height]: DEFAULT_IMAGE_HEIGHT,
};

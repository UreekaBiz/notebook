import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributesTypeFromNodeSpecAttributes, AttributeType } from '../attribute';
import { getRenderAttributes } from '../htmlRenderer/attribute';
import { createNodeDataTypeAttribute, NodeRendererSpec } from '../htmlRenderer/type';
import { getAllowedMarks, MarkName } from '../mark';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../node';
import { NotebookSchemaType } from '../schema';
import { AsyncNodeAttributeSpec, DEFAULT_ASYNC_NODE_STATUS } from './asyncNode';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: This values must have matching types the ones defined in the Extension
const Demo2AsyncNodeAttributeSpec = {
  ...AsyncNodeAttributeSpec,

  [AttributeType.Delay]: noNodeOrMarkSpecAttributeDefaultValue<number>(),

  [AttributeType.TextToReplace]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.FontSize]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.TextColor]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.PaddingTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.MarginTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type Demo2AsyncNodeAttributes = AttributesTypeFromNodeSpecAttributes<typeof Demo2AsyncNodeAttributeSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const Demo2AsyncNodeSpec: NodeSpec = {
  name: NodeName.DEMO_2_ASYNC_NODE,

  content: `${NodeName.TEXT}*`,
  marks: getAllowedMarks([MarkName.BOLD, MarkName.STRIKETHROUGH, MarkName.TEXT_STYLE, MarkName.REPLACED_TEXT_MARK]),

  group: NodeGroup.BLOCK,
  defining: true/*important parent node during replace operations, parent of content preserved on replace operations*/,
  allowGapCursor: true,

  // NOTE: even though codeBlockAsyncNodes aren't meant to contain 'code',
  //       this property in the spec makes PM handle enters as adding newlines
  //       instead of splitting the node without the need to add a
  //       custom plugin that handles the event or anything similar
  code: true,

  attrs: Demo2AsyncNodeAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
const renderDemo2AsyncNodeView = (attributes: Demo2AsyncNodeAttributes, content: string) => {
  const renderAttributes = getRenderAttributes(NodeName.DEMO_2_ASYNC_NODE,
                                              { ...attributes, [AttributeType.Delay]: String(attributes[AttributeType.Delay])/*converting to string since required*/ },
                                              Demo2AsyncNodeRendererSpec,
                                              Demo2AsyncNodeSpec);
  // CHECK: is there any reason this can't use JSX to define the structure?
  // NOTE: must not contain white space, else the renderer has issues
  //       (hence it is a single line below)
  // NOTE: createNodeDataTypeAttribute must be used for all nodeRenderSpecs
  //       that define their own renderNodeView
  // NOTE: Must match the dom created by Demo2AsyncNodeView Model.
  return `<div ${createNodeDataTypeAttribute(NodeName.DEMO_2_ASYNC_NODE)} style="${renderAttributes.style ?? ''}"><div><div>${content}</div></div></div>`;
};

export const Demo2AsyncNodeRendererSpec: NodeRendererSpec<Demo2AsyncNodeAttributes> = {
  tag: 'div',

  isNodeViewRenderer: true/*by definition*/,
  renderNodeView: renderDemo2AsyncNodeView,

  attributes: {/*no need to render attributes*/},
};

export const DEFAULT_DEMO_2_ASYNC_NODE_STATUS = DEFAULT_ASYNC_NODE_STATUS/*alias*/;

export const DEFAULT_DEMO_2_ASYNC_NODE_DELAY = 4000/*ms*/;

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type Demo2AsyncNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: Demo2AsyncNodeAttributes; };
export const isDemo2AsyncNode = (node: ProseMirrorNode<NotebookSchemaType>): node is Demo2AsyncNodeType => node.type.name === NodeName.DEMO_2_ASYNC_NODE;

export const getDemo2AsyncNodeNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.DEMO_2_ASYNC_NODE];
export const createDemo2AsyncNodeNode = (schema: NotebookSchemaType, attributes?: Partial<Demo2AsyncNodeAttributes>, content?: ProseMirrorNodeContent, marks?: Mark<NotebookSchemaType>[]) =>
  getDemo2AsyncNodeNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type Demo2AsyncNodeJSONNodeType = JSONNode<Demo2AsyncNodeAttributes> & { type: NodeName.DEMO_2_ASYNC_NODE; };
export const isDemo2AsyncNodeJSONNode = (node: JSONNode): node is Demo2AsyncNodeJSONNodeType => node.type === NodeName.DEMO_2_ASYNC_NODE;


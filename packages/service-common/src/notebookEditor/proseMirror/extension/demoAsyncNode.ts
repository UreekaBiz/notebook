import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes, AttributeType, noNodeOrMarkSpecAttributeDefaultValue } from '../attribute';
import { getRenderAttributes } from '../htmlRenderer/attribute';
import { createNodeDataTypeAttribute, NodeRendererSpec } from '../htmlRenderer/type';
import { getAllowedMarks } from '../mark';
import { JSONNode, NodeName, ProseMirrorNodeContent } from '../node';
import { NotebookSchemaType } from '../schema';
import { AsyncNodeStatus, asyncNodeStatusToColor } from './asyncNode';
import { CodeBlockAsyncNodeAttributeSpec, createDefaultCodeBlockAsyncNodeAttributes, DEFAULT_CODEBLOCKASYNCNODE_STATUS } from './codeBlockAsyncNode';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Extension
const DemoAsyncNodeAttributeSpec = {
  ...CodeBlockAsyncNodeAttributeSpec,

  [AttributeType.Delay]: noNodeOrMarkSpecAttributeDefaultValue<number>(),
};
export type DemoAsyncNodeAttributes = AttributesTypeFromNodeSpecAttributes<typeof DemoAsyncNodeAttributeSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const DemoAsyncNodeSpec: NodeSpec = {
  name: NodeName.DEMO_ASYNC_NODE,

  marks: getAllowedMarks([/*no Marks allowed for DemoAsyncNode*/]),

  group: 'inline',
  atom: true/*node does not have directly editable content*/,
  leaf: true/*node does not have directly editable content*/,
  inline: true,
  selectable: true,
  draggable: false,
  defining: true/*maintain original node during replace operations if possible*/,
};

// -- Render Spec -----------------------------------------------------------------
const renderDemoAsyncNodeView = (attributes: DemoAsyncNodeAttributes) => {
  const status = attributes[AttributeType.Status] ?? AsyncNodeStatus.NEVER_EXECUTED/*default value*/;
  const text = attributes[AttributeType.Text] ?? ''/*default value*/;

  const renderAttributes = getRenderAttributes(NodeName.DEMO_ASYNC_NODE,
                                              { ...attributes, [AttributeType.Delay]: String(attributes[AttributeType.Delay])/*converting to string since required*/, [AttributeType.CodeBlockHashes]: ''/*not needed*/, [AttributeType.CodeBlockReferences]: ''/*not needed*/ },
                                              DemoAsyncNodeRendererSpec,
                                              DemoAsyncNodeSpec);
  // CHECK: is there any reason this can't use JSX to define the structure?
  // NOTE: must not contain white space, else the renderer has issues
  //       (hence it is a single line below)
  // NOTE: createNodeDataTypeAttribute must be used for all nodeRenderSpecs
  //       that define their own renderNodeView
  return `<span ${createNodeDataTypeAttribute(NodeName.DEMO_ASYNC_NODE)} style="position: relative; display: inline; ${renderAttributes.style ?? ''}"><span style="${DEMO_ASYNCNODE_TEXT_STYLE} ${DEMO_ASYNCNODE_STATUS_COLOR}: ${asyncNodeStatusToColor(status)};" ${DEMO_ASYNCNODE_DATA_STATE}="">${text}</span></span>`;
};

export const DemoAsyncNodeRendererSpec: NodeRendererSpec<DemoAsyncNodeAttributes> = {
  tag: NodeName.DEMO_ASYNC_NODE,

  isNodeViewRenderer: true/*by definition*/,
  renderNodeView: renderDemoAsyncNodeView,

  attributes: {/*no need to render attributes*/},
};

export const DEFAULT_DEMOASYNCNODE_ID = `Default DemoAsyncNode ID`;
export const DEFAULT_DEMOASYNCNODE_STATUS = DEFAULT_CODEBLOCKASYNCNODE_STATUS/*alias*/;
export const DEFAULT_DEMOASYNCNODE_TEXT = 'Not Executed'/*creation default*/;
export const DEFAULT_DEMOASYNCNODE_DELAY = 4000/*ms*/;

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type DemoAsyncNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: DemoAsyncNodeAttributes; };
export const isDemoAsyncNode = (node: ProseMirrorNode<NotebookSchemaType>): node is DemoAsyncNodeType => node.type.name === NodeName.DEMO_ASYNC_NODE;

export const getDemoAsyncNodeNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.DEMO_ASYNC_NODE];
export const createDemoAsyncNodeNode = (schema: NotebookSchemaType, attributes?: DemoAsyncNodeAttributes, content?: ProseMirrorNodeContent, marks?: Mark<NotebookSchemaType>[]) =>
  getDemoAsyncNodeNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type DemoAsyncNodeJSONNodeType = JSONNode<DemoAsyncNodeAttributes> & { type: NodeName.DEMO_ASYNC_NODE; };
export const isDemoAsyncNodeJSONNode = (node: JSONNode): node is DemoAsyncNodeJSONNodeType => node.type === NodeName.DEMO_ASYNC_NODE;

// == Util ========================================================================
export const createDefaultDemoAsyncNodeAttributes = (): Partial<DemoAsyncNodeAttributes> =>
  ({ ...createDefaultCodeBlockAsyncNodeAttributes(), [AttributeType.Delay]: DEFAULT_DEMOASYNCNODE_DELAY });

// == CSS =========================================================================
export const DEMO_ASYNCNODE_TEXT_STYLE = 'padding: 4px; margin-left: 4px; margin-right: 4px; border: 1px solid; border-color: #CBD5E0; border-radius: 4px; background: #EDF2F7; word-break: break-word;';
export const DEMO_ASYNCNODE_STATUS_COLOR = '--status-color';
export const DEMO_ASYNCNODE_DATA_STATE = 'data-demoasyncnodestate';
export const DEMO_ASYNCNODE_BORDER_COLOR = 'border-color: #CBD5E0;';

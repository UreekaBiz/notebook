import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';
import * as ReactDOMServer from 'react-dom/server';

import { AttributeType } from '../../attribute';
import { getRenderAttributes } from '../../htmlRenderer/attribute';
import { NodeRendererSpec } from '../../htmlRenderer/type';
import { getAllowedMarks } from '../../mark';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../../node';
import { NotebookSchemaType } from '../../schema';
import { DemoAsyncNodeAttributes, DemoAsyncNodeAttributeSpec } from './attribute';
import { DemoAsyncNodeComponentJSX } from './jsx';

// ********************************************************************************
// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const DemoAsyncNodeSpec: NodeSpec = {
  name: NodeName.DEMO_ASYNC_NODE,

  marks: getAllowedMarks([/*no Marks allowed for DemoAsyncNode*/]),

  group: NodeGroup.INLINE,
  atom: true/*node does not have directly editable content*/,
  leaf: true/*node does not have directly editable content*/,
  inline: true,
  selectable: true,
  draggable: false,
  defining: true/*maintain original node during replace operations if possible*/,

  attrs: DemoAsyncNodeAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
const renderDemoAsyncNodeView = (attributes: DemoAsyncNodeAttributes) => {
  const renderAttributes = getRenderAttributes(NodeName.DEMO_ASYNC_NODE,
                                              { ...attributes, [AttributeType.Delay]: String(attributes[AttributeType.Delay])/*converting to string since required*/, [AttributeType.CodeBlockHashes]: ''/*not needed*/, [AttributeType.CodeBlockReferences]: ''/*not needed*/ },
                                              DemoAsyncNodeRendererSpec,
                                              DemoAsyncNodeSpec);

  // parses the JSX into a static string that can be rendered.
  return ReactDOMServer.renderToStaticMarkup(<DemoAsyncNodeComponentJSX attrs={attributes} renderAttributes={renderAttributes}/>);
};

export const DemoAsyncNodeRendererSpec: NodeRendererSpec<DemoAsyncNodeAttributes> = {
  tag: 'span',

  isNodeViewRenderer: true/*by definition*/,
  renderNodeView: renderDemoAsyncNodeView,

  attributes: {/*no need to render attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type DemoAsyncNodeType = ProseMirrorNode & { attrs: DemoAsyncNodeAttributes; };
export const isDemoAsyncNode = (node: ProseMirrorNode): node is DemoAsyncNodeType => node.type.name === NodeName.DEMO_ASYNC_NODE;

export const getDemoAsyncNodeNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.DEMO_ASYNC_NODE];
export const createDemoAsyncNodeNode = (schema: NotebookSchemaType, attributes?: Partial<DemoAsyncNodeAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getDemoAsyncNodeNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type DemoAsyncNodeJSONNodeType = JSONNode<DemoAsyncNodeAttributes> & { type: NodeName.DEMO_ASYNC_NODE; };
export const isDemoAsyncNodeJSONNode = (node: JSONNode): node is DemoAsyncNodeJSONNodeType => node.type === NodeName.DEMO_ASYNC_NODE;

import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';
import * as ReactDOMServer from 'react-dom/server';

import { getRenderAttributes } from '../../htmlRenderer/attribute';
import { getReactNodeFromJSX } from '../../htmlRenderer/jsx';
import { NodeRendererSpec } from '../../htmlRenderer/type';
import { getAllowedMarks, MarkName } from '../../mark';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../../node';
import { NotebookSchemaType } from '../../schema';
import { DEFAULT_ASYNC_NODE_STATUS } from '../asyncNode';
import { Demo2AsyncNodeAttributes, Demo2AsyncNodeAttributeSpec } from './attribute';
import { Demo2AsyncNodeComponentJSX } from './jsx';

// ********************************************************************************
// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const Demo2AsyncNodeSpec: NodeSpec = {
  name: NodeName.DEMO_2_ASYNC_NODE,

  content: `${NodeName.TEXT}*`,
  marks: getAllowedMarks([MarkName.BOLD, MarkName.CODE, MarkName.ITALIC, MarkName.REPLACED_TEXT_MARK, MarkName.STRIKETHROUGH, MarkName.SUB_SCRIPT, MarkName.SUPER_SCRIPT, MarkName.TEXT_STYLE, MarkName.UNDERLINE]),

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
  const children = getReactNodeFromJSX(content);
  const renderAttributes = getRenderAttributes(NodeName.CODEBLOCK, { ...attributes, wrap: undefined/*FIXME: Types!*/ }, Demo2AsyncNodeRendererSpec, Demo2AsyncNodeSpec);

  // parses the JSX into a static string that can be rendered.
  return ReactDOMServer.renderToStaticMarkup(
    <Demo2AsyncNodeComponentJSX attrs={attributes} renderAttributes={renderAttributes}>{children}</Demo2AsyncNodeComponentJSX>);
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
export type Demo2AsyncNodeType = ProseMirrorNode & { attrs: Demo2AsyncNodeAttributes; };
export const isDemo2AsyncNode = (node: ProseMirrorNode): node is Demo2AsyncNodeType => node.type.name === NodeName.DEMO_2_ASYNC_NODE;

export const getDemo2AsyncNodeNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.DEMO_2_ASYNC_NODE];
export const createDemo2AsyncNodeNode = (schema: NotebookSchemaType, attributes?: Partial<Demo2AsyncNodeAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getDemo2AsyncNodeNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type Demo2AsyncNodeJSONNodeType = JSONNode<Demo2AsyncNodeAttributes> & { type: NodeName.DEMO_2_ASYNC_NODE; };
export const isDemo2AsyncNodeJSONNode = (node: JSONNode): node is Demo2AsyncNodeJSONNodeType => node.type === NodeName.DEMO_2_ASYNC_NODE;

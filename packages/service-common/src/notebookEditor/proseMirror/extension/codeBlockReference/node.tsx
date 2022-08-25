import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';
import * as ReactDOMServer from 'react-dom/server';

import { isBlank } from '../../../../util/string';
import {  AttributeType } from '../../attribute';
import { getRenderAttributes } from '../../htmlRenderer/attribute';
import { RendererState } from '../../htmlRenderer/state';
import { NodeRendererSpec } from '../../htmlRenderer/type';
import { getAllowedMarks } from '../../mark';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../../node';
import { NotebookSchemaType } from '../../schema';
import { CodeBlockReferenceAttributes, CodeBlockReferenceNodeAttributeSpec, DEFAULT_CODEBLOCK_REFERENCE_NODE_TEXT } from './attribute';
import { CodeBlockReferenceComponentJSX } from './jsx';

// ********************************************************************************
// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const CodeBlockReferenceNodeSpec: NodeSpec = {
  name: NodeName.CODEBLOCK_REFERENCE,

  marks: getAllowedMarks([/*no Marks allowed for CodeBlockReference*/]),

  group: NodeGroup.INLINE,
  atom: true/*node does not have directly editable content*/,
  leaf: true/*node does not have directly editable content*/,
  inline: true,
  selectable: true,
  draggable: false,
  defining: true/*maintain original node during replace operations if possible*/,

  attrs: CodeBlockReferenceNodeAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
const renderCodeBlockReferenceNodeView = (attributes: CodeBlockReferenceAttributes, content: string, state: RendererState) => {
  const codeBlockReference = attributes[AttributeType.CodeBlockReference];

  const renderAttributes = getRenderAttributes(NodeName.CODEBLOCK_REFERENCE, attributes, CodeBlockReferenceNodeRendererSpec, CodeBlockReferenceNodeSpec);

  // gets the visualId
  let visualId: string = DEFAULT_CODEBLOCK_REFERENCE_NODE_TEXT;
  if(!isBlank(codeBlockReference)) {
    const codeBlockId = codeBlockReference;
    if(codeBlockId) {
      visualId = state[NodeName.CODEBLOCK].visualIds[codeBlockId] ?? DEFAULT_CODEBLOCK_REFERENCE_NODE_TEXT;
    } /* else -- no codeblockId */
  } /* else -- no reference */

  // FIXME: This handler is not being registered in the renderer, this is because
  //        the react component is converted into a string that don't allows
  //        javascript to be executed. A fix could be to inline the onClick handler
  //        in the resulting HTML. In the meantime this doesn't work!.
  const handleClick = () => {
    // @ts-ignore FIXME: How to access document from here?
    const codeBlock = document.getElementById(codeBlockReference);
    if(!codeBlock) return/*nothing to do*/;
    codeBlock.focus();
  };

  // parses the JSX into a static string that can be rendered.
  return ReactDOMServer.renderToString(
    <CodeBlockReferenceComponentJSX attrs={attributes} renderAttributes={renderAttributes} visualId={visualId} onClick={handleClick}/>
  );
};

export const CodeBlockReferenceNodeRendererSpec: NodeRendererSpec<CodeBlockReferenceAttributes> = {
  tag: 'span',

  isNodeViewRenderer: true/*by definition*/,
  renderNodeView: renderCodeBlockReferenceNodeView,
  attributes: {/*no need to render attributes*/},
};

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type CodeBlockReferenceNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: CodeBlockReferenceAttributes; };
export const isCodeBlockReferenceNode = (node: ProseMirrorNode<NotebookSchemaType>): node is CodeBlockReferenceNodeType => node.type.name === NodeName.CODEBLOCK_REFERENCE;

export const getCodeBlockReferenceNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.CODEBLOCK_REFERENCE];
export const createCodeBlockReferenceNode = (schema: NotebookSchemaType, attributes?: Partial<CodeBlockReferenceAttributes>, content?: ProseMirrorNodeContent, marks?: Mark<NotebookSchemaType>[]) =>
  getCodeBlockReferenceNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type CodeBlockReferenceJSONNodeType = JSONNode<CodeBlockReferenceAttributes> & { type: NodeName.CODEBLOCK_REFERENCE; };
export const isCodeBlockReferenceJSONNode = (node: JSONNode): node is CodeBlockReferenceJSONNodeType => node.type === NodeName.CODEBLOCK_REFERENCE;

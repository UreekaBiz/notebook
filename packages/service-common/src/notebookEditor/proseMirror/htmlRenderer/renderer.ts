import { DOMOutputSpec, Mark as ProseMirrorMark, MarkSpec, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import {  Attributes, HTMLAttributes } from '../attribute';
import { NotebookDocumentContent } from '../document';
import { BoldMarkRendererSpec } from '../extension/bold';
import { CodeBlockNodeRendererSpec } from '../extension/codeBlock';
import { Demo2AsyncNodeRendererSpec } from '../extension/demo2AsyncNode';
import { DemoAsyncNodeRendererSpec } from '../extension/demoAsyncNode';
import { DocumentNodeRendererSpec } from '../extension/document';
import { HeadingNodeRendererSpec } from '../extension/heading';
import { ImageNodeRendererSpec } from '../extension/image';
import { LinkMarkRendererSpec } from '../extension/link';
import { MarkHolderNodeRendererSpec } from '../extension/markHolder';
import { isParagraphJSONNode, ParagraphNodeRendererSpec } from '../extension/paragraph';
import { ReplacedTextMarkMarkRendererSpec } from '../extension/replacedTextMark';
import { StrikethroughMarkRendererSpec } from '../extension/strikethrough';
import { isTextJSONNode, TextNodeRendererSpec } from '../extension/text';
import { TextStyleMarkRendererSpec } from '../extension/textStyle';
import { getMarkName, JSONMark, MarkName } from '../mark';
import { contentToJSONNode, getNodeName, JSONNode, NodeName } from '../node';
import { MarkSpecs, NodeSpecs } from '../schema';
import { getRenderAttributes, mergeAttributes } from './attribute';
import { computeState, RendererState } from './state';
import { getRenderTag, HTMLString, MarkRendererSpec, NodeRendererSpec, DATA_MARK_TYPE, DATA_NODE_TYPE } from './type';

// ********************************************************************************
// == Type ========================================================================
export const NodeRendererSpecs: Record<NodeName, NodeRendererSpec> = {
  [NodeName.CODEBLOCK]: CodeBlockNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.DEMO_2_ASYNC_NODE]: Demo2AsyncNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.DEMO_ASYNC_NODE]: DemoAsyncNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.DOC]: DocumentNodeRendererSpec,
  [NodeName.HEADING]: HeadingNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.IMAGE]: ImageNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.MARK_HOLDER]: MarkHolderNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.PARAGRAPH]: ParagraphNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.TEXT]: TextNodeRendererSpec,
};

export const MarkRendererSpecs: Record<MarkName, MarkRendererSpec> = {
  [MarkName.BOLD]: BoldMarkRendererSpec,
  [MarkName.LINK]: LinkMarkRendererSpec as any/*FIXME!!!*/,
  [MarkName.REPLACED_TEXT_MARK]: ReplacedTextMarkMarkRendererSpec,
  [MarkName.STRIKETHROUGH]: StrikethroughMarkRendererSpec as any/*FIXME!!!*/,
  [MarkName.TEXT_STYLE]: TextStyleMarkRendererSpec as any/*FIXME!!!*/,
};

// ================================================================================
export const convertContentToHTML = (content: NotebookDocumentContent): HTMLString => {
  const rootNode = contentToJSONNode(content);

  const state = computeState(rootNode);
  return convertJSONContentToHTML(rootNode, state);
};

export const convertJSONContentToHTML = (node: JSONNode, state: RendererState): HTMLString => {
  const { type, content, text } = node;
  const nodeRendererSpec = NodeRendererSpecs[type];

  // if the Node is text and doesn't have Attributes nor Narks render its content as
  // plain text instead of adding a 'span' tag to wrap it. Mimics the functionality
  // of the Editor.
  if(isTextJSONNode(node) && !node.attrs && !node.marks) {
    const { text } = node;
    if(!text || text.length < 1) return ''/*empty content*/;
    // Replace last newline with a br tag. This tag is used to mimic the
    // functionality of ProseMirror, this includes the same class name as the <br>
    // in ProseMirror
    if(text.at(text.length - 1) === '\n') return `${text}<br class="ProseMirror-trailingBreak">`;

    return text;
  }

  // gets the direct children Nodes using the Node content. An empty string is
  // equivalent to having no content when rendering the HTML.
  let children = content ? content.reduce((acc, child) => `${acc}${convertJSONContentToHTML(child, state)}`, '') : ''/*no children*/;

  // in the case that the Node is a Node View Renderer let the Node renderer use
  // its own render function to render the Node and its children.
  if(nodeRendererSpec.isNodeViewRenderer) return nodeRendererSpec.renderNodeView(node.attrs ?? {/*empty attributes*/}, children, state)/*nothing else to do*/;

  // NOTE: in the Editor, a paragraph with no content is displayed as having a
  //       br node as it only child, this is an attempt to mimic that functionality
  //       and keep the HTML output consistent
  if(isParagraphJSONNode(node) && children.length < 1) children = `<br />`;

  const tag = getRenderTag(node.attrs, nodeRendererSpec);
  const nodeSpec = NodeSpecs[node.type];
  const nodeRenderAttributes = getNodeRenderAttributes(node, nodeRendererSpec, nodeSpec);
  const stringAttributes = renderAttributesToString(nodeRenderAttributes);

  const nodeContent = `<${tag} ${DATA_NODE_TYPE}="${node.type}" ${stringAttributes}>${text ?? ''}${children}</${tag}>`;

  // Wraps the Node Content in the given wraps if the Node has any.
  if(!node.marks) return nodeContent/*nothing else to do*/;
  return node.marks.reduce((acc, mark) => convertJSONMarkToHTML(mark, acc), nodeContent/*children to wrap*/);

};

// Converts the Mark into a HTMLString and  wraps the given children in it
const convertJSONMarkToHTML = (mark: JSONMark, children: HTMLString): HTMLString => {
  const markRendererSpec = MarkRendererSpecs[mark.type];
  const tag = getRenderTag(mark.attrs, markRendererSpec);

  const markRenderAttributes = getMarksRenderAttributes(mark);
  const stringAttributes = renderAttributesToString(markRenderAttributes);


  return `<${tag} ${DATA_MARK_TYPE}="${mark.type}" ${stringAttributes}>${children}</${tag}>`;
};

// == Attributes ==================================================================
// -- Node ------------------------------------------------------------------------
// gets an object of Attributes that is used to render the Node
const getNodeRenderAttributes = (node: JSONNode, nodeRendererSpec: NodeRendererSpec | undefined, nodeSpec: NodeSpec | undefined): HTMLAttributes=> {
  const attrs = node.attrs as Record<string, string | undefined/*attribute could be not defined*/>;
  return getRenderAttributes(node.type, attrs, nodeRendererSpec, nodeSpec);
};

// -- Mark ------------------------------------------------------------------------
const getMarksRenderAttributes = (mark: JSONMark): HTMLAttributes => {
  const markSpec = MarkSpecs[mark.type],
        markRendererSpec = MarkRendererSpecs[mark.type];

  const markRenderAttributes = getMarkRenderAttributes(mark, markRendererSpec, markSpec);
  return markRenderAttributes;

};
const getMarkRenderAttributes = (mark: JSONMark, markRendererSpec: MarkRendererSpec | undefined, markSpec: MarkSpec | undefined): HTMLAttributes=> {
  const attrs = mark.attrs as Record<string, string | undefined/*attribute could be not defined*/> | undefined/*none*/;
  return getRenderAttributes(mark.type, attrs, markRendererSpec, markSpec);
};

// == Output Spec =================================================================
export const getNodeOutputSpec = (node: ProseMirrorNode, HTMLAttributes: Attributes, isLeaf: boolean = false): DOMOutputSpec => {
  const nodeName = getNodeName(node);
  const nodeRendererSpec = NodeRendererSpecs[nodeName],
        nodeSpec = NodeSpecs[nodeName];

  // All nodes require to have 'DATA_NODE_TYPE' attribute to be able to identify
  // the Node.
  const attributes = mergeAttributes(HTMLAttributes, { [DATA_NODE_TYPE]: node.type.name });
  const tag = getRenderTag(attributes, nodeRendererSpec);
  const merged = getRenderAttributes(nodeName, attributes, nodeRendererSpec, nodeSpec);

  // Leaf nodes don't need a content hole
  if(isLeaf) return [tag, merged];
  return [tag, merged, 0/*content hole*/];
};

export const getMarkOutputSpec = (mark: ProseMirrorMark, HTMLAttributes: Attributes): DOMOutputSpec => {
  const markName = getMarkName(mark);
  const markRendererSpec = MarkRendererSpecs[markName],
        markSpec = MarkSpecs[markName];

  // All marks require to have 'data-mark-type' attribute to be able to identify
  // the mark.
  const attributes = mergeAttributes(HTMLAttributes, { 'data-mark-type': mark.type.name });
  const tag = getRenderTag(attributes, markRendererSpec);
  const merged = getRenderAttributes(markName, attributes, markRendererSpec, markSpec);
  return [tag, merged];
};

// -- Util ------------------------------------------------------------------------
// parse an object of Attributes into a string in the form of key="value"
export const renderAttributesToString = (attributes: HTMLAttributes) => Object.entries(attributes).reduce((acc, [key, value]) => `${acc} ${key}="${value}" `, '');

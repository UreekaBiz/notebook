import { MarkSpec, NodeSpec } from 'prosemirror-model';

import { NotebookDocumentContent } from '../../type';
import { isStyleAttribute, snakeCaseToKebabCase, HTMLAttributes } from '../attribute';
import { BoldMarkRendererSpec } from '../extension/bold';
import { DocumentNodeRendererSpec } from '../extension/document';
import { HeadingNodeRendererSpec } from '../extension/heading';
import { ParagraphNodeRendererSpec } from '../extension/paragraph';
import { TextNodeRendererSpec } from '../extension/text';
import { TextStyleMarkRendererSpec } from '../extension/textStyle';
import { JSONMark, MarkName } from '../mark';
import { contentToJSONNode, JSONNode, NodeName } from '../node';
import { MarkSpecs, NodeSpecs } from '../schema';
import { getRenderTag, MarkRendererSpec, NodeRendererSpec } from './type';

// ********************************************************************************
// == Type ========================================================================
export type HTMLString = string/*alias*/;

export const NodeRendererSpecs: Record<NodeName, NodeRendererSpec> = {
  [NodeName.DOC]: DocumentNodeRendererSpec,
  [NodeName.HEADING]: HeadingNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.PARAGRAPH]: ParagraphNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.TEXT]: TextNodeRendererSpec,
};

export const MarkRendererSpecs: Record<MarkName, MarkRendererSpec> = {
  [MarkName.BOLD]: BoldMarkRendererSpec,
  [MarkName.TEXT_STYLE]: TextStyleMarkRendererSpec,
};

// ================================================================================
export const convertContentToHTML = (content: NotebookDocumentContent): HTMLString => {
  const rootNode = contentToJSONNode(content);

  return convertJSONContentToHTML(rootNode);
};

export const convertJSONContentToHTML = (node: JSONNode): HTMLString => {
  const { type, content, text } = node;
  const nodeRendererSpec = NodeRendererSpecs[type];
  const tag = getRenderTag(node.attrs, nodeRendererSpec);

  // Gets the direct children nodes using the node content. An empty string is
  // equivalent to having no content when rendering the HTML.
  let children = content ? content.reduce((acc, child) => `${acc}${convertJSONContentToHTML(child)}`, '') : ''/*no children*/;

  // NOTE: On the editor, a paragraph with no content is displayed as having a
  //       br node as it only child, this is an attempt to mimic that functionality
  //       and keep the HTML output consistent.
  if(node.type === NodeName.PARAGRAPH && children.length < 1) children = `<br/>`;

  const nodeSpec = NodeSpecs[node.type];
  const nodeRenderAttributes = getNodeRenderAttributes(node, nodeRendererSpec, nodeSpec),
        markRenderAttributes = getMarksRenderAttributes(node),
        attributes = mergeAttributes(nodeRenderAttributes, markRenderAttributes);
  const stringAttributes = renderAttributesToString(attributes);

  return `<${tag} data-node-type="${node.type}" ${stringAttributes}>${text ?? ''}${children}</${tag}>`;
};

// == Attributes ==================================================================
// -- Node ------------------------------------------------------------------------
// Gets an object of attributes that will be used to render the node.
const getNodeRenderAttributes = (node: JSONNode, nodeRendererSpec: NodeRendererSpec | undefined, nodeSpec: NodeSpec | undefined): HTMLAttributes=> {
  const attrs = node.attrs as Record<string, string | undefined/*attribute could be not defined*/>;
   if(!nodeRendererSpec || !nodeRendererSpec.attributes || !attrs) return {/*empty attributes*/}/*nothing to do*/;

   return getRenderAttributes(attrs, nodeRendererSpec, nodeSpec);
};

// -- Mark ------------------------------------------------------------------------
const getMarksRenderAttributes = (node: JSONNode): HTMLAttributes => {
  if(!node.marks) return {}/*no marks to parse*/;

  // Merges all attributes from the marks of the given node.
  const renderAttributes = node.marks.reduce<HTMLAttributes>((acc, mark) => {
    const markSpec = MarkSpecs[mark.type],
          markRendererSpec = MarkRendererSpecs[mark.type];
    const markRenderAttributes = getMarkRenderAttributes(mark, markRendererSpec, markSpec);
    return mergeAttributes(acc, markRenderAttributes);
  }, {});

  return renderAttributes;
};
const getMarkRenderAttributes = (mark: JSONMark, markRendererSpec: MarkRendererSpec | undefined, markSpec: MarkSpec | undefined): HTMLAttributes=> {
  const attrs = mark.attrs as Record<string, string | undefined/*attribute could be not defined*/>;
  if(!markRendererSpec) return {/*empty attributes*/}/*nothing to do*/;

   return getRenderAttributes(attrs, markRendererSpec, markSpec);
};

// --------------------------------------------------------------------------------
// Gets the render attributes for the given node or mark.
// NOTE: It's defined as function to use function overloads.
// SEE: https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html#overloaded-functions
export function getRenderAttributes(attrs: Record<string, string | undefined>, rendererSpec: NodeRendererSpec, nodeOrMarkSpec: NodeSpec | undefined): HTMLAttributes;
export function getRenderAttributes(attrs: Record<string, string | undefined>, rendererSpec: MarkRendererSpec, nodeOrMarkSpec: MarkSpec | undefined): HTMLAttributes;
export function getRenderAttributes(attrs: Record<string, string | undefined>, rendererSpec: NodeRendererSpec | MarkRendererSpec, nodeOrMarkSpec: NodeSpec | MarkSpec | undefined): HTMLAttributes {
  let renderAttributes: HTMLAttributes = 'render' in rendererSpec ? rendererSpec.render : {};

  // merges the attributes with a default renderer
  if(nodeOrMarkSpec && nodeOrMarkSpec.attrs) {
    Object.keys(nodeOrMarkSpec.attrs).forEach(attribute => {
      // rendererSpec has a defined renderer for this attribute.
      if(attribute in nodeOrMarkSpec) return;
      // else -- use the default renderer.

      const attributes = defaultAttributeRenderer(attribute, attrs[attribute]);
      renderAttributes = mergeAttributes(renderAttributes, attributes);
    });
  } /* else -- no attributes defined on the Node Spec */

  // merges the attributes from the rendererSpec
  Object.entries(rendererSpec.attributes).forEach(([key, value]) => {
    const attributes: HTMLAttributes = typeof value === 'function' ? value(attrs) : value;
    renderAttributes = mergeAttributes(renderAttributes, attributes);
  });
  return renderAttributes;
}

// -- Util ------------------------------------------------------------------------
// Attributes defined on the Node Spec that don't define an Attribute renderer on
// the Node Renderer Spec will use this default renderer.
const defaultAttributeRenderer = (attribute: string, value: string | undefined): HTMLAttributes => {
  if(!value) return {}/*nothing to render*/;

  if(isStyleAttribute(attribute)) return { style: `${snakeCaseToKebabCase(attribute)}: ${value};` };
  // else -- don't have a default renderer.

  return {/*empty attributes*/};
};

// parse an object of attributes into a string in the form of key="value".
const renderAttributesToString = (attributes: HTMLAttributes) => Object.entries(attributes).reduce((acc, [key, value]) => `${key}="${value}" `, '');

// Merge two objects of attributes.
export const mergeAttributes = (a: HTMLAttributes, b: HTMLAttributes): HTMLAttributes => {
  const attributes = { ...a }/*copy*/;

  // Merge both attributes into one.
  Object.entries(b).forEach(([key, value]) => {
    attributes[key] = mergeAttribute(key, attributes[key], value)!/*will be defined by contract*/;
  });

  return attributes;
};

// Merges two attributes values into one value. If there is no way to merge this
// values the second one will be used.
const mergeAttribute = (attribute: string, a: string | undefined, b: string | undefined ): string | undefined => {
  if(!a) return b;
  if(!b) return a;
  // else -- they are both defined, will try to merge them.

  // Append the b to a.
  // NOTE: If b have colliding attributes with a the value of b will be used.
  if(attribute === 'style') return `${a} ${b}`;
  // else -- cannot be merged.

  return b;
};

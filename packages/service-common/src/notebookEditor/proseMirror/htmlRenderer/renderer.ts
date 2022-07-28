import { MarkSpec, NodeSpec } from 'prosemirror-model';

import { isStyleAttribute, snakeCaseToKebabCase, HTMLAttributes } from '../attribute';
import { NotebookDocumentContent } from '../document';
import { BoldMarkRendererSpec } from '../extension/bold';
import { DocumentNodeRendererSpec } from '../extension/document';
import { HeadingNodeRendererSpec } from '../extension/heading';
import { isParagraphJSONNode, ParagraphNodeRendererSpec } from '../extension/paragraph';
import { StrikethroughMarkRendererSpec } from '../extension/strikethrough';
import { isTextJSONNode, TextNodeRendererSpec } from '../extension/text';
import { TextStyleMarkRendererSpec } from '../extension/textStyle';
import { JSONMark, MarkName } from '../mark';
import { contentToJSONNode, JSONNode, NodeName } from '../node';
import { MarkSpecs, NodeSpecs } from '../schema';
import { getRenderTag, AttributeRenderer, HTMLString, MarkRendererSpec, NodeRendererSpec, DATA_NODE_TYPE } from './type';

// ********************************************************************************
// == Type ========================================================================
export const NodeRendererSpecs: Record<NodeName, NodeRendererSpec> = {
  [NodeName.DOC]: DocumentNodeRendererSpec,
  [NodeName.HEADING]: HeadingNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.PARAGRAPH]: ParagraphNodeRendererSpec as any/*FIXME!!!*/,
  [NodeName.TEXT]: TextNodeRendererSpec,
};

export const MarkRendererSpecs: Record<MarkName, MarkRendererSpec> = {
  [MarkName.BOLD]: BoldMarkRendererSpec,
  [MarkName.STRIKETHROUGH]: StrikethroughMarkRendererSpec as any/*FIXME!!!*/,
  [MarkName.TEXT_STYLE]: TextStyleMarkRendererSpec as any/*FIXME!!!*/,
};

// ================================================================================
export const convertContentToHTML = (content: NotebookDocumentContent): HTMLString => {
  const rootNode = contentToJSONNode(content);

  return convertJSONContentToHTML(rootNode);
};

export const convertJSONContentToHTML = (node: JSONNode): HTMLString => {
  const { type, content, text } = node;
  const nodeRendererSpec = NodeRendererSpecs[type];

  // if the Node is text and doesn't have Attributes nor Narks render its content as
  // plain text instead of adding a 'span' tag to wrap it. Mimics the functionality
  // of the Editor.
  if(isTextJSONNode(node) && !node.attrs && !node.marks) return node.text ?? '';

  // gets the direct children Nodes using the Node content. An empty string is
  // equivalent to having no content when rendering the HTML.
  let children = content ? content.reduce((acc, child) => `${acc}${convertJSONContentToHTML(child)}`, '') : ''/*no children*/;

  // in the case that the Node is a Node View Renderer let the Node renderer use
  // its own render function to render the Node and its children.
  if(nodeRendererSpec.isNodeViewRenderer) return nodeRendererSpec.renderNodeView(node.attrs ?? {/*empty attributes*/}, children)/*nothing else to do*/;

  // NOTE: in the Editor, a paragraph with no content is displayed as having a
  //       br node as it only child, this is an attempt to mimic that functionality
  //       and keep the HTML output consistent.
  if(isParagraphJSONNode(node) && children.length < 1) children = `<br/>`;

  const tag = getRenderTag(node.attrs, nodeRendererSpec);
  const nodeSpec = NodeSpecs[node.type];
  const nodeRenderAttributes = getNodeRenderAttributes(node, nodeRendererSpec, nodeSpec),
        markRenderAttributes = getMarksRenderAttributes(node),
        attributes = mergeAttributes(nodeRenderAttributes, markRenderAttributes);
  const stringAttributes = renderAttributesToString(attributes);

  return `<${tag} ${DATA_NODE_TYPE}="${node.type}" ${stringAttributes}>${text ?? ''}${children}</${tag}>`;
};

// == Attributes ==================================================================
// -- Node ------------------------------------------------------------------------
// Gets an object of attributes that will be used to render the node.
const getNodeRenderAttributes = (node: JSONNode, nodeRendererSpec: NodeRendererSpec | undefined, nodeSpec: NodeSpec | undefined): HTMLAttributes=> {
  const attrs = node.attrs as Record<string, string | undefined/*attribute could be not defined*/>;
  return getRenderAttributes(node.type, attrs, nodeRendererSpec, nodeSpec);
};

// -- Mark ------------------------------------------------------------------------
const getMarksRenderAttributes = (node: JSONNode): HTMLAttributes => {
  if(!node.marks) return {}/*no marks to parse*/;

  // merges all Attributes from the Marks of the given Node
  const renderAttributes = node.marks.reduce<HTMLAttributes>((acc, mark) => {
    const markSpec = MarkSpecs[mark.type],
          markRendererSpec = MarkRendererSpecs[mark.type];
    const markRenderAttributes = getMarkRenderAttributes(mark, markRendererSpec, markSpec);
    return mergeAttributes(acc, markRenderAttributes);
  }, {});

  return renderAttributes;
};
const getMarkRenderAttributes = (mark: JSONMark, markRendererSpec: MarkRendererSpec | undefined, markSpec: MarkSpec | undefined): HTMLAttributes=> {
  const attrs = mark.attrs as Record<string, string | undefined/*attribute could be not defined*/> | undefined/*none*/;
  return getRenderAttributes(mark.type, attrs, markRendererSpec, markSpec);
};

// --------------------------------------------------------------------------------
// Gets the render attributes for the given Node or Mark. There are three steps on
// how to get the render attributes:
// 1. Attribute is defined on the NodeSpec/MarkSpec but not on the RendererSpec.
//    In this case, a default renderer is used. If the attribute is not defined
//    the current theme will be used.
// 2. Attribute are present on the RendererSpec. In this case, the renderer is
//    used. If the attribute is not defined the current theme will be used.
// 3. Attribute are present on the Node/Mark itself but there is no corresponding
//    rendererSpec nor NodeSpec/MarkSpec. This could a case of backwards/forwards
//    compatibility problems, in this case a default rendered will be used.
// NOTE: it's defined as function to use function overloads.
// SEE: https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html#overloaded-functions
export function getRenderAttributes(nodeOrMarkName: NodeName | MarkName, attrs?: Record<string, string | undefined>, rendererSpec?: NodeRendererSpec, nodeOrMarkSpec?: NodeSpec): HTMLAttributes;
export function getRenderAttributes(nodeOrMarkName: NodeName | MarkName, attrs?: Record<string, string | undefined>, rendererSpec?: MarkRendererSpec, nodeOrMarkSpec?: MarkSpec): HTMLAttributes;
export function getRenderAttributes(nodeOrMarkName: NodeName | MarkName, attrs: Record<string, string | undefined> = {}, rendererSpec?: NodeRendererSpec | MarkRendererSpec, nodeOrMarkSpec?: NodeSpec | MarkSpec): HTMLAttributes {
  // If the renderer spec doesn't any default attributes to render use and empty
  // object.
  let renderAttributes = rendererSpec?.render ??  {};

  // get the render attributes based on the ones defined in the NodeSpec/MarkSpec
  if(nodeOrMarkSpec && nodeOrMarkSpec.attrs) {
    Object.keys(nodeOrMarkSpec.attrs).forEach(attribute => {
      if(attribute in attrs) return/*prevent duplicated values*/;
      const attributes = getRenderValue(nodeOrMarkName, rendererSpec, attribute, attrs);
      renderAttributes = mergeAttributes(renderAttributes, attributes);
    });
  } /* else -- no attributes defined on the NodeSpec/MarkSpec */

  // merge the attributes that are defined on the Node
  Object.entries(attrs).forEach(([key, value]) => {
    const attributes = getRenderValue(nodeOrMarkName, rendererSpec, key, attrs);
    renderAttributes = mergeAttributes(renderAttributes, attributes);
  });

  return renderAttributes;
}

// -- Util ------------------------------------------------------------------------
// parse an object of attributes into a string in the form of key="value".
const renderAttributesToString = (attributes: HTMLAttributes) => Object.entries(attributes).reduce((acc, [key, value]) => `${acc} ${key}="${value}" `, '');

// ................................................................................
// gets the render attributes for the given attribute. It uses the corresponding
// renderer spec to get the attributes, if there is not a defined renderer spec for
// the given attribute the defaultAttributeRenderer will be used instead. If there
// is no value defined for the attribute the current theme will be used.
const getRenderValue = (nodeOrMarkName: NodeName | MarkName, rendererSpec: NodeRendererSpec | MarkRendererSpec | undefined, attribute: string, attrs: Record<string, string | undefined>): HTMLAttributes => {
  // If the renderer spec has a renderer for this attribute use it.
  if(rendererSpec && attribute in rendererSpec.attributes) {
    const renderValue = rendererSpec.attributes[attribute as keyof typeof rendererSpec.attributes] as AttributeRenderer<any>;
    return typeof renderValue === 'function' ? renderValue(attrs) : renderValue;
  }/* else -- Attribute doesn't have a defined renderer */

  return defaultAttributeRenderer(nodeOrMarkName, attribute, attrs[attribute]);
};

// Attributes defined on the Node Spec that don't define an Attribute renderer on
// the Node Renderer Spec will use this default renderer. If there is no value
// defined for the attribute the current theme will be used.
const defaultAttributeRenderer = (nodeOrMarkName: NodeName | MarkName, attribute: string, value: string | undefined): HTMLAttributes => {
  // If not defined return an empty object.
  if(!value) return {}/*nothing to render*/;

  if(isStyleAttribute(attribute)) return { style: `${snakeCaseToKebabCase(attribute)}: ${value};` };

  return { [attribute]: value };
};

// ................................................................................
// merge two Attribute objects
export const mergeAttributes = (a: HTMLAttributes, b: HTMLAttributes): HTMLAttributes => {
  const attributes = { ...a }/*copy*/;

  // merge both attributes into one
  Object.entries(b).forEach(([key, value]) => {
    attributes[key] = mergeAttribute(key, attributes[key], value)!/*will be defined by contract*/;
  });

  return attributes;
};

// merges two attributes values into a single value. If there is no way to merge this
// values the second one are used
const mergeAttribute = (attribute: string, a: string | undefined, b: string | undefined ): string | undefined => {
  if(!a) return b;
  if(!b) return a;
  // else -- they are both defined, will try to merge them.

  // append the b to a
  // NOTE: if 'b' has Attributes that collide with 'a' then the value of b is used
  if(attribute === 'style') return `${a} ${b}`;
  // else -- cannot be merged

  return b;
};

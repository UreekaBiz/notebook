
import { Attributes, HTMLAttributes } from '../attribute';
import { MarkName } from '../mark';
import { NodeName } from '../node';

// ********************************************************************************
export type HTMLTag = string/*alias*/;
export type HTMLString = string/*alias*/;
export const DEFAULT_RENDER_TAG = 'div';

// == Node ========================================================================
export type TagRenderer<A extends Attributes> = HTMLTag | ((attributes: A) => HTMLTag);
export type AttributeRenderer<A extends Attributes> = HTMLAttributes | ((attributes: A) => HTMLAttributes);
export type NodeViewRenderer<A extends Attributes> = ((attributes: A, content: HTMLString) => HTMLString);

// --------------------------------------------------------------------------------
export type NodeViewRendererSpec<A extends Attributes = {}> = {
  // Defines if the NodeRendererSpec should use renderNodeView to render its
  // content.
  isNodeViewRenderer: true;

  // NodeViews controls how the Node is rendered in the editor, they have full
  // control on how to display its content, for this reason rendering the content
  // is delegated to renderNodeView.
  // A NodeViewRenderer can potentially have content as a children, this function
  // is also responsible for rendering the content.
  renderNodeView: NodeViewRenderer<A>;
};
export type NotNodeViewRendererSpec = {
  // Defines if the NodeRendererSpec should use renderNodeView to render its
  // content.
  isNodeViewRenderer?: never/*don't set this value, no need to use it*/;
};

// --------------------------------------------------------------------------------
// Defines how to render a Node
// SEE: ./renderer.ts
export type NodeRendererSpec<A extends Attributes = {}> = {
  // Defines how to render the tag for this Node. If a string is provided, that
  // tag will be used, otherwise the tag will be determined by the function
  tag: TagRenderer<A>;

  // Determines the attributes that will be used on the node when this Node is
  // rendered. Attributes will be merged with this values and override and
  // any colliding values.
  render?: HTMLAttributes;

  // Defines how to render the attributes for this Node. All values are merged
  // together into a single HTMLAttributes object which is used to render the Node.
  // If no value is provided all attributes use the default renderer.
  attributes: Partial<{ [Attribute in keyof A]: AttributeRenderer<A> }>;
} & ( NodeViewRendererSpec<A> | NotNodeViewRendererSpec );

// == Mark ========================================================================
export type MarkRendererSpec<A extends Attributes = {}> = {
  // Defines how to render the tag for this Mark. If a string is provided, that
  // tag will be used, otherwise the tag will be determined by the function
  tag: TagRenderer<A>;

  // Determines the attributes that will be used on the node when this mark is
  // present. If no value is provided, it will be ignored and only attributes
  // will be used.
  render: HTMLAttributes;

  // Defines how to render the attributes for this Mark. All values are merged
  // together into a single HTMLAttributes object which is used to render the Mark.
  // If no value is provided all attributes use the default renderer.
  attributes: Partial<{ [Attribute in keyof A]: AttributeRenderer<A> }>;
};

// --------------------------------------------------------------------------------
// gets the render tag for the given node. If the tag is not present the
// DEFAULT_RENDER_TAG will be used for backwards / forwards compatibility.
export const getRenderTag = (attributes: Partial<Attributes> = {}, rendererSpec: NodeRendererSpec | MarkRendererSpec | undefined): HTMLTag => {
  if(!rendererSpec || !rendererSpec.tag) return DEFAULT_RENDER_TAG;

  return typeof rendererSpec.tag === 'string' ? rendererSpec.tag : rendererSpec.tag(attributes);
};

// --------------------------------------------------------------------------------
// Returns the string that gets added to the rendered tag, both for the Renderer
// and for the output Spec of a Node. This function or its constant must be used
// for the getNodeOutputSpec, the Renderer and AbstractNodeViews
export const DATA_NODE_TYPE = 'data-node-type';
export const createNodeDataTypeAttribute = (nodeName: NodeName) => `${DATA_NODE_TYPE}="${nodeName}"`;

export const DATA_MARK_TYPE = 'data-mark-type';
export const createMarkDataTypeAttribute = (markName: MarkName) => `${DATA_MARK_TYPE}="${markName}"`;

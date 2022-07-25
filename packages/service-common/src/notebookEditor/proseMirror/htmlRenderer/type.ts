import { Attributes, HTMLAttributes } from '../attribute';

// ********************************************************************************
export type HTMLTag = string/*alias*/;
export const DEFAULT_RENDER_TAG = 'div';

// --------------------------------------------------------------------------------
type TagRenderer<A extends Attributes> = HTMLTag | ((attributes: A) => HTMLTag);
type AttributeRenderer<A extends Attributes> = HTMLAttributes | ((jsonNode: A) => HTMLAttributes);

// --------------------------------------------------------------------------------
// Defines how to render a Node.
// SEE: ./renderer.ts
export type NodeRendererSpec<A extends Attributes = {}> = {
  // Defines how to render the tag for this Node. If a string is provided, that
  // tag will be used, otherwise the tag will be determined by the function
  tag: TagRenderer<A>;

  // Defines how to render the attributes for this Node. All values are merged
  // together into a single HTMLAttributes object which is used to render the Node.
  // If no value is provided all attributes use the default renderer.
  attributes: Partial<{ [Attribute in keyof A]: AttributeRenderer<A> }>;
};

export type MarkRendererSpec<A extends Attributes = {}> = {
  // Determines the attributes that will be used on the node when this mark is
  // present. If no value is provided, it will be ignored and only attributes
  // will be used.
  render: HTMLAttributes;

  // Defines how to render the attributes for this Mark. All values are merged
  // together into a single HTMLAttributes object which is used to render the Mark.
  // If no value is provided all attributes use the default renderer.
  attributes: Partial<{ [Attribute in keyof A]: AttributeRenderer<A> }>;
}


// --------------------------------------------------------------------------------
// Gets the render tag for the given node. If the tas is not present the
// DEFAULT_RENDER_TAG will be used for backwards / forwards compatibility.
export const getRenderTag = (attributes: Partial<Attributes> = {}, nodeRendererSpec: NodeRendererSpec | undefined): HTMLTag => {
  if(!nodeRendererSpec || !nodeRendererSpec.tag) return DEFAULT_RENDER_TAG;

  return typeof nodeRendererSpec.tag === 'string' ? nodeRendererSpec.tag : nodeRendererSpec.tag(attributes);
};

import { MarkSpec, NodeSpec } from 'prosemirror-model';

import { HTMLAttributes, isStyleAttribute, snakeCaseToKebabCase } from '../attribute';
import { MarkName } from '../mark';
import { NodeName } from '../node';
import { AttributeRenderer, MarkRendererSpec, NodeRendererSpec } from './type';

// NOTE: This is in a different file to avoid circular dependencies
// ********************************************************************************
// gets the render Attributes for the given Node or Mark. There are three steps on
// how to get the render Attributes:
// 1. Attribute is defined on the NodeSpec/MarkSpec but not on the RendererSpec.
//    In this case, a default renderer is used. If the Attribute is not defined
//    the current Theme is used.
// 2. Attribute are present on the RendererSpec. In this case, the renderer is
//    used. If the Attribute is not defined the current Theme is used.
// 3. Attribute are present on the Node/Mark itself but there is no corresponding
//    RendererSpec nor NodeSpec/MarkSpec. This could a case of backwards/forwards
//    compatibility problems. In this case a default rendered is used.
// NOTE: it's defined as function to use function overloads.

// SEE: https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html#overloaded-functions
export function getRenderAttributes(nodeOrMarkName: NodeName | MarkName, attrs?: Record<string, string | undefined>, rendererSpec?: NodeRendererSpec<any>, nodeOrMarkSpec?: NodeSpec): HTMLAttributes;
export function getRenderAttributes(nodeOrMarkName: NodeName | MarkName, attrs?: Record<string, string | undefined>, rendererSpec?: MarkRendererSpec<any>, nodeOrMarkSpec?: MarkSpec): HTMLAttributes;
export function getRenderAttributes(nodeOrMarkName: NodeName | MarkName, attrs: Record<string, string | undefined> = {}, rendererSpec?: NodeRendererSpec<any> | MarkRendererSpec, nodeOrMarkSpec?: NodeSpec | MarkSpec): HTMLAttributes {
  // If the renderer spec doesn't any default attributes to render use and empty
  // object.
  let renderAttributes = rendererSpec?.render ??  {};

  // get the render Attributes based on the ones defined in the NodeSpec/MarkSpec
  if(nodeOrMarkSpec && nodeOrMarkSpec.attrs) {
    Object.keys(nodeOrMarkSpec.attrs).forEach(attribute => {
      if(attribute in attrs) return/*prevent duplicated values*/;
      const attributes = getRenderValue(nodeOrMarkName, rendererSpec, attribute, attrs);
      renderAttributes = mergeAttributes(renderAttributes, attributes);
    });
  } /* else -- no Attributes defined on the NodeSpec/MarkSpec */

  // merge the Attributes that are defined on the Node
  Object.entries(attrs).forEach(([key, value]) => {
    const attributes = getRenderValue(nodeOrMarkName, rendererSpec, key, attrs);
    renderAttributes = mergeAttributes(renderAttributes, attributes);
  });

  return renderAttributes;
}

// ................................................................................
// gets the render Attributes for the given Attribute. It uses the corresponding
// Renderer Spec to get the Attributes, if there is not a defined Renderer Spec for
// the given Attribute then #defaultAttributeRenderer() is used instead. If there
// is no value defined for the Attribute the current Theme is used.
const getRenderValue = (nodeOrMarkName: NodeName | MarkName, rendererSpec: NodeRendererSpec | MarkRendererSpec | undefined, attribute: string, attrs: Record<string, string | undefined>): HTMLAttributes => {
  // if the renderer spec has a renderer for this attribute use it.
  if(rendererSpec && attribute in rendererSpec.attributes) {
    const renderValue = rendererSpec.attributes[attribute as keyof typeof rendererSpec.attributes] as AttributeRenderer<any>;
    return typeof renderValue === 'function' ? renderValue(attrs) : renderValue;
  } /* else -- Attribute doesn't have a defined renderer */

  return defaultAttributeRenderer(nodeOrMarkName, attribute, attrs[attribute]);
};

// Attributes defined on the Node Spec that don't define an Attribute renderer on
// the Node Renderer Spec use this default renderer. If there is no value
// defined for the attribute the current theme is used.
const defaultAttributeRenderer = (nodeOrMarkName: NodeName | MarkName, attribute: string, value: string | undefined): HTMLAttributes => {
  // if not defined return an empty object
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
    attributes[key] = mergeAttribute(key, attributes[key], value)!/*is defined by contract*/;
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

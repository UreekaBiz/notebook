// ********************************************************************************
// -- Type ------------------------------------------------------------------------
export enum SetAttributeType { STRING = 'string', BOOLEAN = 'boolean', NUMBER = 'number', ARRAY = 'array' }
export type Attributes = Partial<Record<AttributeType, any>>;
export type HTMLAttributes = Record<string, string>;

// Is there any other type of attribute that is not a string? If so add it below.
export type AttributeValue = string;
export enum AttributeType {
  // CSS Styles
  Width = 'width',
  Height = 'height',

  MarginTop = 'marginTop',
  MarginBottom = 'marginBottom',
  MarginLeft = 'marginLeft',
  MarginRight = 'marginRight',

  PaddingTop = 'paddingTop',
  PaddingBottom = 'paddingBottom',
  PaddingLeft = 'paddingLeft',
  PaddingRight = 'paddingRight',

  // Text Style
  FontSize = 'fontSize',
  TextColor = 'color',
  TextAlign = 'textAlign',
  VerticalAlign = 'verticalAlign',

  // Custom
  Id = 'id',
  Level = 'level',
  InitialMarksSet = 'initialMarksSet',
}

export type StyleAttributes = {
  [AttributeType.Width]: string;
  [AttributeType.Height]: string;

  [AttributeType.FontSize]: string;
  [AttributeType.TextColor]: string;
  [AttributeType.TextColor]: string;
  [AttributeType.VerticalAlign]: string;

  [AttributeType.MarginTop]: string;
  [AttributeType.MarginBottom]: string;
  [AttributeType.MarginLeft]: string;
  [AttributeType.MarginRight]: string;

  [AttributeType.PaddingTop]: string;
  [AttributeType.PaddingBottom]: string;
  [AttributeType.PaddingLeft]: string;
  [AttributeType.PaddingRight]: string;
};
const styleAttributeSet = new Set([
  AttributeType.FontSize,
  AttributeType.TextColor,
  AttributeType.TextAlign,
  AttributeType.VerticalAlign,

  AttributeType.Width,
  AttributeType.Height,

  AttributeType.MarginTop,
  AttributeType.MarginBottom,
  AttributeType.MarginLeft,
  AttributeType.MarginRight,

  AttributeType.PaddingTop,
  AttributeType.PaddingBottom,
  AttributeType.PaddingLeft,
  AttributeType.PaddingRight,
]);
export const isStyleAttribute = (property: any) => styleAttributeSet.has(property);

// -- Spacing ---------------------------------------------------------------------
export type Margin = {
  [AttributeType.MarginTop]: string;
  [AttributeType.MarginBottom]: string;
  [AttributeType.MarginLeft]: string;
  [AttributeType.MarginRight]: string;
};
export type MarginAttribute = keyof Margin;
export const isMarginAttribute = (attribute: AttributeType) => attribute.includes('margin');

export type Padding = {
  [AttributeType.PaddingTop]: string;
  [AttributeType.PaddingBottom]: string;
  [AttributeType.PaddingLeft]: string;
  [AttributeType.PaddingRight]: string;
};
export type PaddingAttribute = keyof Padding;
export const isPaddingAttribute = (attribute: AttributeType) => attribute.includes('padding');

export type SpacingType = 'margin' | 'padding';
export type SpacingAttribute = MarginAttribute | PaddingAttribute;

// -- Alignment -------------------------------------------------------------------
export enum TextAlign {
  left = 'left',
  center = 'center',
  right = 'right',
  justify = 'justify'
}

export enum VerticalAlign {
  top = 'text-top',
  middle = 'middle',
  bottom = 'sub'/*default*/,
}

// == Node Spec ===================================================================
export type NodeSpecAttributeDefaultValue = { default: any; };
export type NodeSpecAttributes = Partial<Record<AttributeType, NodeSpecAttributeDefaultValue>>;
// NOTE: Defining an Attribute in a NodeSpec requires to define a default value,
//       in this case the default value is defined on the Extension itself, the one
//       that is being used in the NodeSpec definition is only used to define the
//       Schema and doesn't need to have a default value, its value will always be
//       the one defined by the Extension.
//       This function expects a type to be provided, this is useful to define at
//       this level which type of attribute is expected on the Extension itself
//       and the HTML renderer.
// SEE: node.ts
export const noNodeSpecAttributeDefaultValue = <T>() => ({ default: undefined/*no default value*/ as unknown as T });

// Infers the types of the attributes from the NodeSpec using the default value
// provided by noNodeSpecAttributeDefaultValue. This function should be used when
// creating a NodeSpec and getting the types that will be shared all across the
// editor including the extension and the HTML renderer.
// @ts-ignore: 'default' is not assignable to key of type A[key]. TS cannot infer
//            that 'default' will always be present since defined on the Generic.
export type AttributesTypeFromNodeSpecAttributes<A extends NodeSpecAttributes> = { [key in keyof A]: A[key]['default'] };

// == Util ========================================================================
export const snakeCaseToKebabCase = (str: string) => {
  const res = Array.from(str).reduce((acc, char) => `${acc}${char === char.toUpperCase() ? `-${char.toLowerCase()}` : char}`, '');
  return res;
};

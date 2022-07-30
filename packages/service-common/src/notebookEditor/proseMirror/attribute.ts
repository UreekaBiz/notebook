// ********************************************************************************
// -- Type ------------------------------------------------------------------------
export enum SetAttributeType { STRING = 'string', BOOLEAN = 'boolean', NUMBER = 'number', ARRAY = 'array' }
export type Attributes = Partial<Record<AttributeType, any>>;
export type HTMLAttributes = Record<string, string>;

// Is there any other type of attribute that is not a string? If so add it below.
export type AttributeValue = string;
export enum AttributeType {
  // -- CSS Styles ----------------------------------------------------------------
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

  // -- Text Style ----------------------------------------------------------------
  FontSize = 'fontSize',
  TextColor = 'color',
  TextAlign = 'textAlign',
  VerticalAlign = 'verticalAlign',

  // -- Custom --------------------------------------------------------------------
  // .. General ...................................................................
  Id = 'id',
  InitialMarksSet = 'initialMarksSet',

  // .. Heading ...................................................................
  Level = 'level',
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
/** record of margin attributes and merge attribute value */
export type Margin = Record<AttributeType.MarginTop | AttributeType.MarginBottom | AttributeType.MarginLeft | AttributeType.MarginRight,
                            MergedAttributeValue>;
export type MarginAttribute = keyof Margin;
export const isMarginAttribute = (attribute: AttributeType) => attribute.includes('margin');

/** record of padding attributes and merge attribute value */
export type Padding = Record<AttributeType.PaddingTop | AttributeType.PaddingBottom | AttributeType.PaddingLeft | AttributeType.PaddingRight,
                            MergedAttributeValue>;
export type PaddingAttribute = keyof Padding;
export const isPaddingAttribute = (attribute: AttributeType) => attribute.includes('padding');

export type SpacingType = 'margin' | 'padding';
export type SpacingAttribute = MarginAttribute | PaddingAttribute;

export const getOppositeSpacingAttribute = (attribute: SpacingAttribute) => {
  switch(attribute) {
    case AttributeType.MarginBottom: return AttributeType.MarginTop;
    case AttributeType.MarginTop: return AttributeType.MarginBottom;
    case AttributeType.MarginLeft: return AttributeType.MarginRight;
    case AttributeType.MarginRight: return AttributeType.MarginLeft;

    case AttributeType.PaddingBottom: return AttributeType.PaddingTop;
    case AttributeType.PaddingTop: return AttributeType.PaddingBottom;
    case AttributeType.PaddingLeft: return AttributeType.PaddingRight;
    case AttributeType.PaddingRight: return AttributeType.PaddingLeft;
  }
};

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
export const noNodeOrMarkSpecAttributeDefaultValue = <T>() => ({ default: undefined/*no default value*/ as unknown as T });

// Infers the types of the attributes from the NodeSpec using the default value
// provided by noNodeOrMarkSpecAttributeDefaultValue. This function should be used
// when creating a NodeSpec and getting the types that will be shared all across
// the editor including the extension and the HTML renderer.
// @ts-ignore: 'default' is not assignable to key of type A[key]. TS cannot infer
//            that 'default' will always be present since defined on the Generic.
export type AttributesTypeFromNodeSpecAttributes<A extends NodeSpecAttributes> = { [key in keyof A]: A[key]['default'] | undefined};

// == Util ========================================================================
export const snakeCaseToKebabCase = (str: string) => {
  const res = Array.from(str).reduce((acc, char) => `${acc}${char === char.toUpperCase() ? `-${char.toLowerCase()}` : char}`, '');
  return res;
};

// -- Merging ---------------------------------------------------------------------
// Symbol that is used when the merged value of the given attributes is invalid.
// This usually means that the values are not compatible in some way.
export const InvalidMergedAttributeValue = Symbol('invalidMergedAttribute');
export type MergedAttributeValue = AttributeValue | typeof InvalidMergedAttributeValue/*could not be merged*/ | undefined/*no value*/;

// Merges the given AttributeValues into one MergedAttributeValue.
export const mergeAttributeValues = (a: MergedAttributeValue | undefined, b: MergedAttributeValue | undefined): MergedAttributeValue => {
  // If one of the values is invalid it cannot be merged.
  if(a === InvalidMergedAttributeValue || b === InvalidMergedAttributeValue) return InvalidMergedAttributeValue;

  // If one of the values if not defined will default to the other value.
  if(!a) return b;
  if(!b) return a;

  // If they are equal return either of those
  if(a === b) return a;

  // else -- the value is invalid.
  return InvalidMergedAttributeValue;
};

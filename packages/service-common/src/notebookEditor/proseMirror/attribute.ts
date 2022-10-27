// ********************************************************************************
// -- Constant --------------------------------------------------------------------
// nodes whose style changes based on some action (e.g. pressing CMD or CTRL)
// get this attribute added to their renderer definition (SEE: index.css)
export const ACTIONABLE_NODE = 'actionable-node';

// -- Type ------------------------------------------------------------------------
export enum SetAttributeType {
  STRING = 'string',
  STYLE = 'style',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  ARRAY = 'array'
}
export type Attributes = Partial<Record<AttributeType, any>>;
export type AttributeValue = string | number | undefined;
export type HTMLAttributes = Record<string, AttributeValue>;

export enum AttributeType {
  // -- CSS Styles ----------------------------------------------------------------
  BackgroundColor = 'backgroundColor',

  BorderColor = 'borderColor',
  BorderTop = 'borderTop',
  BorderBottom = 'borderBottom',
  BorderLeft = 'borderLeft',
  BorderRight = 'borderRight',
  BorderStyle = 'borderStyle',
  BorderWidth = 'borderWidth',

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
  Color = 'color',
  FontFamily = 'fontFamily',
  FontWeight = 'fontWeight',
  FontSize = 'fontSize',
  LineHeight = 'lineHeight',
  TextAlign = 'textAlign',
  TextDecoration = 'textDecoration',
  VerticalAlign = 'verticalAlign',

  // -- Custom --------------------------------------------------------------------
  // .. General ...................................................................
  Id = 'id',
  Text = 'text',

  // .. AsyncNode .................................................................
  Status = 'status',

  // .. CodeBlock .................................................................
  Type = 'type',
  Wrap = 'wrap',

  // .. CodeBlockReference ........................................................
  CodeBlockReference = 'codeBlockReference',
  LeftDelimiter = 'leftDelimiter',
  RightDelimiter = 'rightDelimiter',

  // .. Demo Async Node ...........................................................
  CodeBlockReferences = 'codeBlockReferences',
  CodeBlockHashes = 'codeBlockHashes',
  Delay = 'delay',

  // .. Demo 2 Async Node .........................................................
  TextToReplace = 'textToReplace',

  // .. Heading ...................................................................
  Level = 'level',

  // .. Image .....................................................................
  Alt = 'alt',
  Src = 'src',
  Title = 'title',
  Uploaded = 'uploaded',

  // .. Link ......................................................................
  Href = 'href',
  Target = 'target',

  // .. ListItem  .................................................................
  Separator = 'separator',
  ListStyleType = 'listStyleType',

  // .. MarkHolder ................................................................
  StoredMarks = 'storedMarks',

  // .. Ordered List ..............................................................
  // NOTE: corresponds to the 'start' HTML attribute from the 'ol' HTML tag
  StartValue = 'start',

  // .. TaskListItem ..............................................................
  Checked = 'checked',
}

export type StyleAttributes = {
  [AttributeType.BackgroundColor]: string;

  [AttributeType.BorderColor]: string;
  [AttributeType.BorderTop]: string;
  [AttributeType.BorderBottom]: string;
  [AttributeType.BorderLeft]: string;
  [AttributeType.BorderRight]: string;
  [AttributeType.BorderStyle]: string;
  [AttributeType.BorderWidth]: string;

  [AttributeType.Width]: string;
  [AttributeType.Height]: string;

  [AttributeType.FontSize]: string;
  [AttributeType.Color]: string;
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
  AttributeType.BackgroundColor,

  AttributeType.BorderColor,
  AttributeType.BorderTop,
  AttributeType.BorderBottom,
  AttributeType.BorderLeft,
  AttributeType.BorderRight,
  AttributeType.BorderStyle,
  AttributeType.BorderWidth,

  AttributeType.Width,
  AttributeType.Height,

  AttributeType.FontSize,
  AttributeType.Color,
  AttributeType.TextAlign,
  AttributeType.VerticalAlign,

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
/** gets a record of styles attributes that are present on the styleAttributesSet */
export const filterStyleAttributes = (attributes: Attributes) => {
  const filteredAttributes: Record<string, string> = {};
  for(const [key, value] of Object.entries(attributes)) {
    if(isStyleAttribute(key)) {
      filteredAttributes[key] = value;
    }
  }
  return filteredAttributes;
};

export const getWrapStyles = (isWrap: boolean) => `white-space: ${isWrap ? 'break-spaces' : 'pre'};`;

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

// -- Border ----------------------------------------------------------------------
export enum BorderStyle {
  dashed = 'dashed',
  dotted = 'dotted',
  solid = 'solid',
}
export const isBorderStyle = (value: any): value is BorderStyle => Object.values(BorderStyle).includes(value);

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
  // if one of the values is invalid it cannot be merged.
  if(a === InvalidMergedAttributeValue || b === InvalidMergedAttributeValue) return InvalidMergedAttributeValue;

  // if one of the values if not defined will default to the other value.
  if(!a) return b;
  if(!b) return a;

  // if they are equal return either of those
  if(a === b) return a;

  // the value is invalid
  return InvalidMergedAttributeValue;
};

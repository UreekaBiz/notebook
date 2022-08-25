import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../../attribute';
import { NodeIdentifier } from '../../node';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: This values must have matching types the ones defined in the Extension.
export const CodeBlockAttributesSpec = {
  [AttributeType.Id]: noNodeOrMarkSpecAttributeDefaultValue<NodeIdentifier>(),

  /** a ContentType-like string that defines what code is in the CodeBlock */
  [AttributeType.Type]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  /** does the text wrap within the CodeBlock */
  [AttributeType.Wrap]: noNodeOrMarkSpecAttributeDefaultValue<boolean>(),

  [AttributeType.PaddingTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.MarginTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type CodeBlockAttributes = AttributesTypeFromNodeSpecAttributes<typeof CodeBlockAttributesSpec>;
export const isCodeBlockAttributes = (attrs: any): attrs is CodeBlockAttributes => attrs.id !== undefined && attrs.wrap !== undefined;

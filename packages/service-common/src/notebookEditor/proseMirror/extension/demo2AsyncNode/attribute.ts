
import { noNodeOrMarkSpecAttributeDefaultValue, AttributesTypeFromNodeSpecAttributes, AttributeType } from '../../attribute';
import { AsyncNodeAttributeSpec } from '../asyncNode';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: This values must have matching types the ones defined in the Extension
export const Demo2AsyncNodeAttributeSpec = {
  ...AsyncNodeAttributeSpec,

  [AttributeType.Delay]: noNodeOrMarkSpecAttributeDefaultValue<number>(),

  [AttributeType.TextToReplace]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.FontSize]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.TextColor]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.PaddingTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.MarginTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type Demo2AsyncNodeAttributes = AttributesTypeFromNodeSpecAttributes<typeof Demo2AsyncNodeAttributeSpec>;

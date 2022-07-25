import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes, AttributeType, noNodeSpecAttributeDefaultValue } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// ================================================================================
// -- Attribute -------------------------------------------------------------------
// NOTE: This values must have matching types the ones defined in the Extension.
const TextStyleAttributesSpec = {
  [AttributeType.TextColor]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.FontSize]: noNodeSpecAttributeDefaultValue<string>(),
};
export type TextStyleAttributes = AttributesTypeFromNodeSpecAttributes<typeof TextStyleAttributesSpec>;

// ================================================================================
// -- Mark Spec -------------------------------------------------------------------
export const TextStyleMarkSpec: MarkSpec = {
  name: MarkName.TEXT_STYLE,
  attrs: TextStyleAttributesSpec,
};

// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type TextStyleMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: TextStyleAttributes; };
export const isTextStyleMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is TextStyleMarkType => mark.type.name === MarkName.TEXT_STYLE;

// ================================================================================
// -- Render Spec -----------------------------------------------------------------
export const TextStyleMarkRendererSpec: MarkRendererSpec<TextStyleAttributes> = {
  render: {/*don't render anything by default*/},

  attributes: {/*use the default renderer on all attributes*/},
};

import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes, AttributeType, noNodeSpecAttributeDefaultValue } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Extension.
const TextStyleAttributesSpec = {
  [AttributeType.TextColor]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.FontSize]: noNodeSpecAttributeDefaultValue<string>(),
};
export type TextStyleAttributes = AttributesTypeFromNodeSpecAttributes<typeof TextStyleAttributesSpec>;

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const TextStyleMarkSpec: MarkSpec = {
  name: MarkName.TEXT_STYLE/*expected and guaranteed to be unique*/,
  attrs: TextStyleAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const TextStyleMarkRendererSpec: MarkRendererSpec<TextStyleAttributes> = {
  // NOTE: The tag is only used for the Editor, the HTML renderer will use the tag
  //       of the TextNode instead. SEE: ./renderer.ts
  tag: 'span',
  render: {/*don't render anything by default*/},

  attributes: {/*use the default renderer on all attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type TextStyleMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: TextStyleAttributes; };
export const isTextStyleMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is TextStyleMarkType => mark.type.name === MarkName.TEXT_STYLE;

// -- JSON Mark Type --------------------------------------------------------------
export type TextStyleJSONMarkType = JSONMark<TextStyleAttributes> & { type: MarkName.TEXT_STYLE; };
export const isTextStyleJSONMark = (mark: JSONMark): mark is TextStyleJSONMarkType => mark.type === MarkName.TEXT_STYLE;

import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const UnderlineAttributesSpec = {/*no attributes*/};
export type UnderlineAttributes = AttributesTypeFromNodeSpecAttributes<typeof UnderlineAttributesSpec>;

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const UnderlineMarkSpec: MarkSpec = {
  name: MarkName.UNDERLINE/*expected and guaranteed to be unique*/,

  // NOTE: toDOM must be defined so that the Schema knows how to create it
  //       (SEE: schema.ts)
  // NOTE: toDOM tag must match renderer tag
  toDOM: (mark, inline) => ['u', UnderlineMarkSpec],

  attributes: UnderlineAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const UnderlineMarkRendererSpec: MarkRendererSpec<UnderlineAttributes> = {
  // NOTE: the tag is only used for the Editor. The HTML renderer uses the tag of
  //       the TextNode instead
  // SEE: ./renderer.ts
  // NOTE: renderer tag must match toDOM tag
  tag: 'u',
  render: { style: 'text-decoration: underline;' },

  attributes: {/*no Attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type UnderlineMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: UnderlineAttributes; };
export const isUnderlineMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is UnderlineMarkType => mark.type.name === MarkName.UNDERLINE;

export const getUnderlineMarkType = (schema: NotebookSchemaType) => schema.marks[MarkName.UNDERLINE];
export const createUnderlineMark = (schema: NotebookSchemaType, attributes?: Partial<UnderlineAttributes>) => getUnderlineMarkType(schema).create(attributes);

// -- JSON Mark Type --------------------------------------------------------------
export type UnderlineJSONMarkType = JSONMark<UnderlineAttributes> & { type: MarkName.UNDERLINE; };
export const isUnderlineJSONMark = (mark: JSONMark): mark is UnderlineJSONMarkType => mark.type === MarkName.UNDERLINE;

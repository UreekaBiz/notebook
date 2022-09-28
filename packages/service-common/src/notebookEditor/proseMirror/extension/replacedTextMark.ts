import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const ReplacedTextMarkAttributesSpec = {/*no attributes*/};
export type ReplacedTextMarkAttributes = AttributesTypeFromNodeSpecAttributes<typeof ReplacedTextMarkAttributesSpec>;

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const ReplacedTextMarkMarkSpec: MarkSpec = {
  name: MarkName.REPLACED_TEXT_MARK/*expected and guaranteed to be unique*/,

  // NOTE: toDOM must be defined so that the Schema knows how to create it
  //       (SEE: schema.ts)
  // NOTE: toDOM tag must match renderer tag
  toDOM: (mark, inline) => ['span', ReplacedTextMarkMarkSpec],

  attributes: ReplacedTextMarkAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const ReplacedTextMarkMarkRendererSpec: MarkRendererSpec<ReplacedTextMarkAttributes> = {
  // NOTE: the tag is only used for the Editor. The HTML renderer uses the tag of
  //       the TextNode instead
  // SEE: ./renderer.ts
  // NOTE: renderer tag must match toDOM tag
  tag: 'span',
  render: { style: 'color: #0F0ABD;' },

  attributes: {/*no Attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type ReplacedTextMarkMarkType = ProseMirrorMark & { attrs: ReplacedTextMarkAttributes; };
export const isReplacedTextMarkMark = (mark: ProseMirrorMark): mark is ReplacedTextMarkMarkType => mark.type.name === MarkName.REPLACED_TEXT_MARK;

export const getReplacedTextMarkMarkType = (schema: NotebookSchemaType) => schema.marks[MarkName.REPLACED_TEXT_MARK];
export const createReplacedTextMarkMark = (schema: NotebookSchemaType, attributes?: Partial<ReplacedTextMarkAttributes>) => getReplacedTextMarkMarkType(schema).create(attributes);

// -- JSON Mark Type --------------------------------------------------------------
export type ReplacedTextMarkJSONMarkType = JSONMark<ReplacedTextMarkAttributes> & { type: MarkName.REPLACED_TEXT_MARK; };
export const isReplacedTextMarkJSONMark = (mark: JSONMark): mark is ReplacedTextMarkJSONMarkType => mark.type === MarkName.REPLACED_TEXT_MARK;

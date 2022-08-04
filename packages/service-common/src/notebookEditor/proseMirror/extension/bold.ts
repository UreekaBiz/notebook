import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const BoldAttributesSpec = {/*no attributes*/};
export type BoldAttributes = AttributesTypeFromNodeSpecAttributes<typeof BoldAttributesSpec>;

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const BoldMarkSpec: MarkSpec = {
  name: MarkName.BOLD/*expected and guaranteed to be unique*/,

  // NOTE: toDOM must be defined so that the Schema knows how to create it
  //       (SEE: schema.ts)
  // NOTE: toDOM tag must match renderer tag
  toDOM: (mark, inline) => ['strong', BoldMarkSpec],

  attributes: BoldAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const BoldMarkRendererSpec: MarkRendererSpec<BoldAttributes> = {
  // NOTE: the tag is only used for the Editor. The HTML renderer uses the tag of
  //       the TextNode instead
  // SEE: ./renderer.ts
  // NOTE: renderer tag must match toDOM tag
  tag: 'strong',
  render: { style: 'font-weight: bold;' },

  attributes: {/*no Attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type BoldMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: BoldAttributes; };
export const isBoldMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is BoldMarkType => mark.type.name === MarkName.BOLD;

export const getBoldMarkType = (schema: NotebookSchemaType) => schema.marks[MarkName.BOLD];
export const createBoldMark = (schema: NotebookSchemaType, attributes?: BoldAttributes) => getBoldMarkType(schema).create(attributes);

// -- JSON Mark Type --------------------------------------------------------------
export type BoldJSONMarkType = JSONMark<BoldAttributes> & { type: MarkName.BOLD; };
export const isBoldJSONMark = (mark: JSONMark): mark is BoldJSONMarkType => mark.type === MarkName.BOLD;

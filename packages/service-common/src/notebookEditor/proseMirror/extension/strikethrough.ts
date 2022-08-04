import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const StrikethroughAttributesSpec = {/*no attributes*/};
export type StrikethroughAttributes = AttributesTypeFromNodeSpecAttributes<typeof StrikethroughAttributesSpec>;

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const StrikethroughMarkSpec: MarkSpec = {
  name: MarkName.STRIKETHROUGH/*expected and guaranteed to be unique*/,

  // NOTE: toDOM must be defined so that the Schema knows how to create it
  //       (SEE: schema.ts)
  // NOTE: toDOM tag must match renderer tag
  toDOM: (mark, inline) => ['s', StrikethroughMarkSpec],

  attrs: StrikethroughAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const StrikethroughMarkRendererSpec: MarkRendererSpec<StrikethroughAttributes> = {
  // NOTE: the tag is only used for the Editor. The HTML renderer uses the tag of
  //       the TextNode instead
  // SEE: ./renderer.ts
  // NOTE: renderer tag must match toDOM tag
  tag: 's',
  render: { style: 'text-decoration: line-through;' },

  attributes: {/*no attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type StrikethroughMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: StrikethroughAttributes; };
export const isStrikethroughMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is StrikethroughMarkType => mark.type.name === MarkName.STRIKETHROUGH;

export const getStrikethroughMarkType = (schema: NotebookSchemaType) => schema.marks[MarkName.STRIKETHROUGH];
export const createStrikethroughMark = (schema: NotebookSchemaType, attributes?: StrikethroughAttributes) => getStrikethroughMarkType(schema).create(attributes);

// -- JSON Mark Type --------------------------------------------------------------
export type StrikethroughJSONMarkType = JSONMark<StrikethroughAttributes> & { type: MarkName.STRIKETHROUGH; };
export const isStrikethroughJSONMark = (mark: JSONMark): mark is StrikethroughJSONMarkType => mark.type === MarkName.STRIKETHROUGH;

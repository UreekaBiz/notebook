import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const ItalicAttributesSpec = {/*no attributes*/};
export type ItalicAttributes = AttributesTypeFromNodeSpecAttributes<typeof ItalicAttributesSpec>;

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const ItalicMarkSpec: MarkSpec = {
  name: MarkName.ITALIC/*expected and guaranteed to be unique*/,

  // NOTE: toDOM must be defined so that the Schema knows how to create it
  //       (SEE: schema.ts)
  // NOTE: toDOM tag must match renderer tag
  toDOM: (mark, inline) => ['em', ItalicMarkSpec],

  attributes: ItalicAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const ItalicMarkRendererSpec: MarkRendererSpec<ItalicAttributes> = {
  // NOTE: the tag is only used for the Editor. The HTML renderer uses the tag of
  //       the TextNode instead
  // SEE: ./renderer.ts
  // NOTE: renderer tag must match toDOM tag
  tag: 'em',
  render: { style: 'font-style: italic;' },

  attributes: {/*no Attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type ItalicMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: ItalicAttributes; };
export const isItalicMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is ItalicMarkType => mark.type.name === MarkName.ITALIC;

export const getItalicMarkType = (schema: NotebookSchemaType) => schema.marks[MarkName.ITALIC];
export const createItalicMark = (schema: NotebookSchemaType, attributes?: Partial<ItalicAttributes>) => getItalicMarkType(schema).create(attributes);

// -- JSON Mark Type --------------------------------------------------------------
export type ItalicJSONMarkType = JSONMark<ItalicAttributes> & { type: MarkName.ITALIC; };
export const isItalicJSONMark = (mark: JSONMark): mark is ItalicJSONMarkType => mark.type === MarkName.ITALIC;

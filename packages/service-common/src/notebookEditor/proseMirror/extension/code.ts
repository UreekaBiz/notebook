import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes, noNodeOrMarkSpecAttributeDefaultValue, AttributeType } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const CodeAttributesSpec = {
  [AttributeType.BackgroundColor]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type CodeAttributes = AttributesTypeFromNodeSpecAttributes<typeof CodeAttributesSpec>;

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const CodeMarkSpec: MarkSpec = {
  name: MarkName.CODE/*expected and guaranteed to be unique*/,

  code: true/*contains Code*/,

  // NOTE: toDOM must be defined so that the Schema knows how to create it
  //       (SEE: schema.ts)
  // NOTE: toDOM tag must match renderer tag
  toDOM: (mark, inline) => ['code', CodeMarkSpec],

  attributes: CodeAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const CodeMarkRendererSpec: MarkRendererSpec<CodeAttributes> = {
  // NOTE: the tag is only used for the Editor. The HTML renderer uses the tag of
  //       the TextNode instead
  // SEE: ./renderer.ts
  // NOTE: renderer tag must match toDOM tag
  tag: 'code',
  render: {/*no Attributes*/},

  attributes: {/*no Attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type CodeMarkType = ProseMirrorMark & { attrs: CodeAttributes; };
export const isCodeMark = (mark: ProseMirrorMark): mark is CodeMarkType => mark.type.name === MarkName.CODE;

export const getCodeMarkType = (schema: NotebookSchemaType) => schema.marks[MarkName.CODE];
export const createCodeMark = (schema: NotebookSchemaType, attributes?: Partial<CodeAttributes>) => getCodeMarkType(schema).create(attributes);

// -- JSON Mark Type --------------------------------------------------------------
export type CodeJSONMarkType = JSONMark<CodeAttributes> & { type: MarkName.CODE; };
export const isCodeJSONMark = (mark: JSONMark): mark is CodeJSONMarkType => mark.type === MarkName.CODE;

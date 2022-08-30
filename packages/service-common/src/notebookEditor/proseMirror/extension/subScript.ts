import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const SubScriptAttributesSpec = {/*no attributes*/};
export type SubScriptAttributes = AttributesTypeFromNodeSpecAttributes<typeof SubScriptAttributesSpec>;

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const SubScriptMarkSpec: MarkSpec = {
  name: MarkName.SUB_SCRIPT/*expected and guaranteed to be unique*/,

  // REF: https://prosemirror.net/docs/ref/#model.MarkSpec.excludes
  // NOTE: Marks that specify this prop must exclude themselves (which is the
  //       default behavior when not specified)
  excludes: `${MarkName.SUB_SCRIPT/*exclude itself*/} ${MarkName.SUPER_SCRIPT/*do not allow coexistence with Superscript*/}`,

  // NOTE: toDOM must be defined so that the Schema knows how to create it
  //       (SEE: schema.ts)
  // NOTE: toDOM tag must match renderer tag
  toDOM: (mark, inline) => ['sub', SubScriptMarkSpec],

  attributes: SubScriptAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const SubScriptMarkRendererSpec: MarkRendererSpec<SubScriptAttributes> = {
  // NOTE: the tag is only used for the Editor. The HTML renderer uses the tag of
  //       the TextNode instead
  // SEE: ./renderer.ts
  // NOTE: renderer tag must match toDOM tag
  tag: 'sub',
  render: { style: 'vertical-align: sub;' },

  attributes: {/*no Attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type SubScriptMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: SubScriptAttributes; };
export const isSubScriptMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is SubScriptMarkType => mark.type.name === MarkName.SUB_SCRIPT;

export const getSubScriptMarkType = (schema: NotebookSchemaType) => schema.marks[MarkName.SUB_SCRIPT];
export const createSubScriptMark = (schema: NotebookSchemaType, attributes?: Partial<SubScriptAttributes>) => getSubScriptMarkType(schema).create(attributes);

// -- JSON Mark Type --------------------------------------------------------------
export type SubScriptJSONMarkType = JSONMark<SubScriptAttributes> & { type: MarkName.SUB_SCRIPT; };
export const isSubScriptJSONMark = (mark: JSONMark): mark is SubScriptJSONMarkType => mark.type === MarkName.SUB_SCRIPT;

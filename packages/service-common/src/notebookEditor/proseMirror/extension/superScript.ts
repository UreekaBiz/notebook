import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const SuperScriptAttributesSpec = {/*no attributes*/};
export type SuperScriptAttributes = AttributesTypeFromNodeSpecAttributes<typeof SuperScriptAttributesSpec>;

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const SuperScriptMarkSpec: MarkSpec = {
  name: MarkName.SUPER_SCRIPT/*expected and guaranteed to be unique*/,

  // REF: https://prosemirror.net/docs/ref/#model.MarkSpec.excludes
  // NOTE: Marks that specify this prop must exclude themselves (which is the
  //       default behavior when not specified)
  excludes: `${MarkName.SUPER_SCRIPT/*exclude itself*/} ${MarkName.SUB_SCRIPT/*do not allow coexistence with Subscript*/}`,

  // NOTE: toDOM must be defined so that the Schema knows how to create it
  //       (SEE: schema.ts)
  // NOTE: toDOM tag must match renderer tag
  toDOM: (mark, inline) => ['sup', SuperScriptMarkSpec],

  attributes: SuperScriptAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const SuperScriptMarkRendererSpec: MarkRendererSpec<SuperScriptAttributes> = {
  // NOTE: the tag is only used for the Editor. The HTML renderer uses the tag of
  //       the TextNode instead
  // SEE: ./renderer.ts
  // NOTE: renderer tag must match toDOM tag
  tag: 'sup',
  render: { style: 'vertical-align: super;' },

  attributes: {/*no Attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type SuperScriptMarkType = ProseMirrorMark & { attrs: SuperScriptAttributes; };
export const isSuperScriptMark = (mark: ProseMirrorMark): mark is SuperScriptMarkType => mark.type.name === MarkName.SUPER_SCRIPT;

export const getSuperScriptMarkType = (schema: NotebookSchemaType) => schema.marks[MarkName.SUPER_SCRIPT];
export const createSuperScriptMark = (schema: NotebookSchemaType, attributes?: Partial<SuperScriptAttributes>) => getSuperScriptMarkType(schema).create(attributes);

// -- JSON Mark Type --------------------------------------------------------------
export type SuperScriptJSONMarkType = JSONMark<SuperScriptAttributes> & { type: MarkName.SUPER_SCRIPT; };
export const isSuperScriptJSONMark = (mark: JSONMark): mark is SuperScriptJSONMarkType => mark.type === MarkName.SUPER_SCRIPT;

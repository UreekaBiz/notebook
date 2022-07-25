import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { MarkRendererSpec } from '../htmlRenderer/type';
import { MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// -- Attribute -------------------------------------------------------------------
export type BoldAttributes = {/*currently none*/};

// ================================================================================
// -- Mark Spec -------------------------------------------------------------------
export const BoldMarkSpec: MarkSpec = {
  name: MarkName.BOLD,
};

// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type BoldMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: BoldAttributes; };
export const isBoldMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is BoldMarkType => mark.type.name === MarkName.BOLD;

// ================================================================================
// -- Render Spec -----------------------------------------------------------------
export const BoldMarkRendererSpec: MarkRendererSpec = {
  render: { style: 'font-weight: bold;' },

  attributes: {/*no attributes*/},
};

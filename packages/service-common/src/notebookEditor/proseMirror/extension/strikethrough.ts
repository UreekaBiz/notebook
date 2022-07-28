import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
export type StrikethroughAttributes = {/*currently none*/};

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const StrikethroughMarkSpec: MarkSpec = {
  name: MarkName.STRIKETHROUGH/*expected and guaranteed to be unique*/,
};

// -- Render Spec -----------------------------------------------------------------
export const StrikethroughMarkRendererSpec: MarkRendererSpec<StrikethroughAttributes> = {
  // NOTE: The tag is only used for the Editor, the HTML renderer will use the tag
  //       of the TextNode instead. SEE: ./renderer.ts
  tag: 's',
  render: {/*currently nothing*/},

  attributes: {/*no attributes*/},
};

// == Type ========================================================================
// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type StrikethroughMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: StrikethroughAttributes; };
export const isStrikethroughMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is StrikethroughMarkType => mark.type.name === MarkName.STRIKETHROUGH;

// -- JSON Mark Type --------------------------------------------------------------
export type StrikethroughJSONMarkType = JSONMark<StrikethroughAttributes> & { type: MarkName.STRIKETHROUGH; };
export const isStrikethroughJSONMark = (mark: JSONMark): mark is StrikethroughJSONMarkType => mark.type === MarkName.STRIKETHROUGH;

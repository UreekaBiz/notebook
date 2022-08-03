import { Mark as ProseMirrorMark, MarkSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributesTypeFromNodeSpecAttributes, AttributeType } from '../attribute';
import { MarkRendererSpec } from '../htmlRenderer/type';
import { JSONMark, MarkName } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************,************************************************************
// == Attribute ===================================================================
const LinkAttributeSpec = {
  /* The link this mark points to */
  [AttributeType.Href]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  /* (SEE: REF below) */
  [AttributeType.Target]: noNodeOrMarkSpecAttributeDefaultValue<LinkTarget>(),

  [AttributeType.TextColor]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type LinkAttributes = AttributesTypeFromNodeSpecAttributes<typeof LinkAttributeSpec>

// REF: https://www.w3schools.com/tags/att_a_target.asp
export enum LinkTarget {
  BLANK = '_blank'/*opens in a new tab*/,
  SELF = '_self'/*opens the linked doc in the same frame as it was clicked*/,
  PARENT = '_parent'/*opens the linked doc in the parent frame*/,
  TOP = '_top'/*opens the linked doc in the full body of the window*/
}
export const isLinkTargetValue = (value: string): value is LinkTarget => value in LinkTarget;

// REF: https://pointjupiter.com/what-noopener-noreferrer-nofollow-explained/
export const DEFAULT_LINK_HREF = ''/*default empty*/;
export const DEFAULT_LINK_TARGET = LinkTarget.BLANK;
export const DEFAULT_LINK_TAG = 'a[href]:not([href *= "javascript:" i])'/*ignore links with javascript*/;

export const LINK_PROTOCOLS = [/*currently empty*/];

// == Spec ========================================================================
// -- Mark Spec -------------------------------------------------------------------
export const LinkMarkSpec: MarkSpec = {
  name: MarkName.LINK,
  keepOnSplit: false/*do not keep mark when splitting a node*/,

  // REF: https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive
  inclusive: false/*do not continue typing with link mark after having added one*/,

  // NOTE: toDOM must be defined so that the Schema knows how to create it
  //       (SEE: schema.ts)
  toDOM: (mark, inline) => [LinkMarkRendererSpec.tag, LinkMarkSpec],

  attrs: LinkAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const LinkMarkRendererSpec: MarkRendererSpec<LinkAttributes> = {
  // FIXME: Not actually rendering as an 'a' tag
  tag: 'a',
  render: {
    rel: 'noopener noreferrer nofollow'/*for general link sanity*/,
    style: 'text-decoration: underline;cursor: inherit;',
  },

  attributes: {/*use default renderer*/},
};

// -- Mark Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type LinkMarkType = ProseMirrorMark<NotebookSchemaType> & { attrs: LinkAttributes; };
export const isLinkMarkAttributes = (attrs: any): attrs is LinkAttributes => 'href' in attrs && 'target' in attrs;
export const isLinkMark = (mark: ProseMirrorMark<NotebookSchemaType>): mark is LinkMarkType => mark.type.name === MarkName.LINK;

export const getLinkMarkType = (schema: NotebookSchemaType) => schema.marks[MarkName.LINK];
export const createLinkMark = (schema: NotebookSchemaType, attributes?: LinkAttributes) => getLinkMarkType(schema).create(attributes);

// -- JSON Mark Type --------------------------------------------------------------
export type LinkJSONMarkType = JSONMark<LinkAttributes> & { type: MarkName.LINK; };
export const isLinkJSONMark = (mark: JSONMark): mark is LinkJSONMarkType => mark.type === MarkName.LINK;

// == Util ========================================================================
export const DEFAULT_LINK_ATTRIBUTES: Partial<LinkAttributes> = {
  href: DEFAULT_LINK_HREF,
  target: DEFAULT_LINK_TARGET,
};

// NOTE: This property has to be taken into account when inserting links
//       Otherwise, ranges that should not necessarily receive a link might do so
//       (SEE: Link.ts #commands, linkCreate.ts)
export const PREVENT_LINK_META = 'preventAutoLink';

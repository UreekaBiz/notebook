import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { JSONNode, NodeGroup, NodeIdentifier, NodeName } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Extension.
const HeadingAttributesSpec = {
  [AttributeType.Id]: noNodeOrMarkSpecAttributeDefaultValue<NodeIdentifier>(),

  [AttributeType.Level]: noNodeOrMarkSpecAttributeDefaultValue<HeadingLevel>(),

  // Since headings have a default set of marks applied to them on creation, they
  // are required to have the 'initialMarksSet' attribute to ensure correct
  // creation behavior.
  // SEE: setDefaultMarks
  [AttributeType.InitialMarksSet]: noNodeOrMarkSpecAttributeDefaultValue<boolean>(),

  [AttributeType.FontSize]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.TextColor]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.PaddingTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.MarginTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type HeadingAttributes = AttributesTypeFromNodeSpecAttributes<typeof HeadingAttributesSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const HeadingNodeSpec: NodeSpec = {
  name: NodeName.HEADING/*expected and guaranteed to be unique*/,

  group: NodeGroup.BLOCK,
  content: `${NodeGroup.INLINE}*`,
  defining: true,

  attrs: HeadingAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const HeadingNodeRendererSpec: NodeRendererSpec<HeadingAttributes> = {
  tag: attributes => {
    switch(attributes.level) {
      default: /*use H1 if level is unknown*/
      case HeadingLevel.One:
        return 'h1';
      case HeadingLevel.Two:
        return 'h2';
      case HeadingLevel.Three:
        return 'h3';
    }
  },

  attributes: {/*use the default renderer on all attributes*/},
};

// == Type ========================================================================
export enum HeadingLevel { One = 1, Two = 2, Three = 3 }
export const isHeadingLevel = (level: number): level is HeadingLevel => level in HeadingLevel;

/** Gets the heading level from a H1, H2 or H3 tag. This tag is case insensitive. */
export const getHeadingLevelFromTag = (tag: string): HeadingLevel | undefined => {
  const match = tag.match(/^h([1-3])$/i);
  if(!match) return undefined/*invalid heading level*/;

  const level = parseInt(match[1]/*second element is the one in the group selection from the regex*/);
  // Only return a valid value.
  if(isHeadingLevel(level)) return level/*nothing else to do*/;
  return undefined;
};

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type HeadingNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: HeadingAttributes; };
export const isHeadingNode = (node: ProseMirrorNode<NotebookSchemaType>): node is HeadingNodeType => node.type.name === NodeName.HEADING;

// -- JSON Node Type --------------------------------------------------------------
export type HeadingJSONNodeType = JSONNode<HeadingAttributes> & { type: NodeName.HEADING; };
export const isHeadingJSONNode = (node: JSONNode): node is HeadingJSONNodeType => node.type === NodeName.HEADING;

import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { NodeIdentifier, NodeName, NodeType } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
export enum HeadingLevel { One = 1, Two = 2, Three = 3 }
export const isHeadingLevel = (level: number): level is HeadingLevel => level in HeadingLevel;

// ================================================================================
// -- Attribute -------------------------------------------------------------------
// NOTE: This values must have matching types the ones defined in the Extension.
const HeadingAttributesSpec = {
  [AttributeType.Id]: noNodeSpecAttributeDefaultValue<NodeIdentifier>(),

  [AttributeType.Level]: noNodeSpecAttributeDefaultValue<HeadingLevel>(),

  // Since headings have a default set of marks applied to them on creation, they
  // are required to have the 'initialMarksSet' attribute to ensure correct
  // creation behavior.
  // SEE: setDefaultMarks
  [AttributeType.InitialMarksSet]: noNodeSpecAttributeDefaultValue<boolean>(),

  [AttributeType.FontSize]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.TextColor]: noNodeSpecAttributeDefaultValue<string>(),

  [AttributeType.PaddingTop]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingBottom]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingLeft]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingRight]: noNodeSpecAttributeDefaultValue<string>(),

  [AttributeType.MarginTop]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginBottom]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginLeft]: noNodeSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginRight]: noNodeSpecAttributeDefaultValue<string>(),
};
export type HeadingAttributes = AttributesTypeFromNodeSpecAttributes<typeof HeadingAttributesSpec>;

// ================================================================================
// -- Node Spec -------------------------------------------------------------------
export const HeadingNodeSpec: NodeSpec = {
  name: NodeName.HEADING,

  group: NodeType.BLOCK,
  content: `${NodeType.INLINE}*`,
  defining: true,

  attrs: HeadingAttributesSpec,
};

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type HeadingNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: HeadingAttributes; };
export const isHeadingNode = (node: ProseMirrorNode<NotebookSchemaType>): node is HeadingNodeType => node.type.name === NodeName.HEADING;

// ================================================================================
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

  attributes: {
    [AttributeType.FontSize]: attributes => {
      let fontSize;
      if(attributes[AttributeType.FontSize]) fontSize = attributes[AttributeType.FontSize];
      else {
        switch(attributes[AttributeType.Level]) {
          default: /*use H1 if level is unknown*/
          case HeadingLevel.One:
            fontSize = '34px;';
            break;
          case HeadingLevel.Two:
            fontSize = '25px;';
            break;
          case HeadingLevel.Three:
            fontSize = '20px;';
            break;
          }
      }
      return { style: `font-size: ${fontSize};` };
    },
    [AttributeType.TextColor]: attributes => {
      let color;
      if(attributes[AttributeType.TextColor]) color = attributes[AttributeType.TextColor];
      else {
        switch(attributes[AttributeType.Level]) {
          default: /*use H1 if level is unknown*/
          case HeadingLevel.One:
            color = '#1C5987';
            break;
          case HeadingLevel.Two:
            color = '#4E7246';
            break;
          case HeadingLevel.Three:
            color = '#89B181';
            break;
          }
      }
      return { style: `color: ${color};` };
    },
  },
};

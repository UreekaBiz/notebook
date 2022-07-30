import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { NodeGroup, NodeIdentifier, NodeName } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: this value must have matching types -- the ones defined in the Extension
const TitleAttributeSpec = {
  [AttributeType.Id]: noNodeOrMarkSpecAttributeDefaultValue<NodeIdentifier>(),
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
export type TitleAttributes = AttributesTypeFromNodeSpecAttributes<typeof TitleAttributeSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const TitleNodeSpec: NodeSpec = {
  name: NodeName.TITLE,

  group: NodeGroup.BLOCK,
  content: `${NodeName.TEXT}*`,
};

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type TitleNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: TitleAttributes; };
export const isTitleNode = (node: ProseMirrorNode<NotebookSchemaType>): node is TitleNodeType => node.type.name === NodeName.TITLE;

// ================================================================================
// -- Render Spec -----------------------------------------------------------------
export const TitleNodeRendererSpec: NodeRendererSpec<TitleAttributes> = {
  tag: 'div',

  attributes: {/*use the default renderer on all Attributes*/},
};

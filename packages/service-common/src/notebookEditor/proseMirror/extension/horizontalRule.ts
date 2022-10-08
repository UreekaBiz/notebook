import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributesTypeFromNodeSpecAttributes, AttributeType } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const HorizontalRuleAttributeSpec = {
  [AttributeType.BackgroundColor]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.Height]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type HorizontalRuleAttributes = AttributesTypeFromNodeSpecAttributes<typeof HorizontalRuleAttributeSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const HorizontalRuleNodeSpec: NodeSpec = {
  name: NodeName.HORIZONTAL_RULE,

  atom: true/*this Node should be treated as a single unit in the View*/,
  draggable: false,
  group: `${NodeGroup.BLOCK}`,

  attrs: HorizontalRuleAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const HorizontalRuleNodeRendererSpec: NodeRendererSpec<HorizontalRuleAttributes> = {
  tag: 'hr',

  attributes: {/*use the default renderer on all Attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type HorizontalRuleNodeType = ProseMirrorNode & { attrs: HorizontalRuleAttributes; };
export const isHorizontalRuleNode = (node: ProseMirrorNode): node is HorizontalRuleNodeType => node.type.name === NodeName.HORIZONTAL_RULE;

export const getHorizontalRuleNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.HORIZONTAL_RULE];
export const createHorizontalRuleNode = (schema: NotebookSchemaType, attributes?: Partial<HorizontalRuleAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getHorizontalRuleNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type HorizontalRuleJSONNodeType = JSONNode<HorizontalRuleAttributes> & { type: NodeName.HORIZONTAL_RULE; };
export const isHorizontalRuleJSONNode = (node: JSONNode): node is HorizontalRuleJSONNodeType => node.type === NodeName.HORIZONTAL_RULE;

// --------------------------------------------------------------------------------
export const DEFAULT_HORIZONTAL_RULE_BACKGROUND_COLOR = '#CCCCCC'/*gray*/;
export const DEFAULT_HORIZONTAL_RULE_HEIGHT = '2px'/*T&E*/;

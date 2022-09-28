import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { getAllowedMarks } from '../mark';
import { JSONNode, NodeGroup, NodeName, ProseMirrorNodeContent } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the MarkSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const MarkHolderAttributeSpec = {
  // NOTE: this attribute is a stringified version of the array holding the marks
  //       to prevent parsing issues in both copy-paste operations, and loading
  //       MarkHolder Nodes from the server in the Notebook repo
  // the stringified version of an array containing the stored marks
  [AttributeType.StoredMarks]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type MarkHolderAttributes = AttributesTypeFromNodeSpecAttributes<typeof MarkHolderAttributeSpec>

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const MarkHolderNodeSpec: Readonly<NodeSpec> = {
  name: NodeName.MARK_HOLDER/*expected and guaranteed to be unique*/,

  marks: getAllowedMarks([/*no Marks allowed for MarkHolder Node*/]),

  group: NodeGroup.INLINE,
  inline: true,
  selectable: false/*do not allow this Node to be set as a NodeSelection*/,
  atom: true/*MarkHolder should be treated as a single unit in the View*/,
  leaf: true/*MarkHolder has no Content*/,

  attrs: MarkHolderAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const MarkHolderNodeRendererSpec: NodeRendererSpec<MarkHolderAttributes> = {
  tag: 'div',

  attributes: {
    // render the marks in the DOM to ensure that the copy/paste functionality works
    [AttributeType.StoredMarks]: (attributes) => {
      const attributeStoredMarks = attributes[AttributeType.StoredMarks];
      if(!attributeStoredMarks) { return { [AttributeType.StoredMarks]: ''/*no stored marks*/ }; }

      // (SEE: #storedMarksToDOM below)
      return { [AttributeType.StoredMarks]: storedMarksToDOM(attributeStoredMarks) };
    },
  },
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type MarkHolderNodeType = ProseMirrorNode & { attrs: MarkHolderAttributes; };
export const isMarkHolderNode = (node: ProseMirrorNode): node is MarkHolderNodeType => node.type.name === NodeName.MARK_HOLDER;

export const getMarkHolderNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.MARK_HOLDER];
export const createMarkHolderNode = (schema: NotebookSchemaType, attributes?: Partial<MarkHolderAttributes>, content?: ProseMirrorNodeContent, marks?: Mark[]) =>
  getMarkHolderNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type MarkHolderJSONNodeType = JSONNode<MarkHolderAttributes> & { type: NodeName.MARK_HOLDER; };
export const isMarkHolderJSONNode = (node: JSONNode): node is MarkHolderJSONNodeType => node.type === NodeName.MARK_HOLDER;

// == Util ========================================================================
// NOTE: to prevent any issues with the renderer, the marks get stringified
//       with single quotes. When they are parsed back, they MUST replaced
//       back with double quotes (SEE: MarkHolder.ts)
const storedMarksToDOM = (attributeStoredMarks: string) => JSON.stringify(attributeStoredMarks).replaceAll("\"", "'");

// NOTE: exported since its used by the parseHTML behavior for the MarkHolder
// parse the Marks to the right format when copy pasting
// (SEE: #storedMarksToDOM above)
export const storedMarksFromDOM = (attributeStoredMarks: string) => JSON.parse(attributeStoredMarks.replaceAll("'", "\""));

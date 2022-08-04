import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
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
    // Render the marks in the DOM to ensure that the copy/paste functionality works
    [AttributeType.StoredMarks]: (attributes) => {
      const storedMarks = attributes[AttributeType.StoredMarks];
      if(!storedMarks) { return { [AttributeType.StoredMarks]: ''/*no stored marks*/ }; }

      // NOTE: to prevent any issues with the renderer, the marks get stringified
      //       with single quotes. When they are parsed back, they MUST replaced
      //       back with double quotes (SEE: MarkHolder.ts)
      return { [AttributeType.StoredMarks]: JSON.stringify(storedMarks).replaceAll("\"", "'") };
    },
  },
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type MarkHolderNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: MarkHolderAttributes; };
export const isMarkHolderNode = (node: ProseMirrorNode<NotebookSchemaType>): node is MarkHolderNodeType => node.type.name === NodeName.MARK_HOLDER;

export const getMarkHolderNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.MARK_HOLDER];
export const createMarkHolderNode = (schema: NotebookSchemaType, attributes?: MarkHolderAttributes, content?: ProseMirrorNodeContent, marks?: Mark<NotebookSchemaType>[]) =>
  getMarkHolderNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type MarkHolderJSONNodeType = JSONNode<MarkHolderAttributes> & { type: NodeName.MARK_HOLDER; };
export const isMarkHolderJSONNode = (node: JSONNode): node is MarkHolderJSONNodeType => node.type === NodeName.MARK_HOLDER;

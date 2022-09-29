import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeRendererSpec } from '../htmlRenderer/type';
import { getAllowedMarks } from '../mark';
import { JSONNode, NodeGroup, NodeName } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: this value must have matching types -- the ones defined in the Extension
const DocumentAttributesSpec = {/*no attributes*/};
export type DocumentAttributes = AttributesTypeFromNodeSpecAttributes<typeof DocumentAttributesSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const DocumentNodeSpec: NodeSpec = {
  name: NodeName.DOC/*expected and guaranteed to be unique*/,

  // NOTE: Is expected that the schema using this node explicitly defines that this
  //       is the top node.
  // SEE:  src/common/notebookEditor/schema.ts
  topNode: true/*it's the node that will be used as a root for the document*/,

  content: `${NodeGroup.BLOCK}+`,
  marks: getAllowedMarks([/*no Marks allowed for Doc Node*/]),

  attrs: DocumentAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const DocumentNodeRendererSpec: NodeRendererSpec<DocumentAttributes> = {
  tag: 'div',

  attributes: {/*no Attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the Attributes
export type DocumentNodeType = ProseMirrorNode & { attrs: DocumentAttributes; };
export const isDocumentNode = (node: ProseMirrorNode): node is DocumentNodeType => node.type.name === NodeName.DOC;

export const getDocumentNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.DOC];
// NOTE: Document has no create document Util function since there can only be
//       one of it per document

// -- JSON Node Type --------------------------------------------------------------
export type DocumentJSONNodeType = JSONNode<DocumentAttributes> & { type: NodeName.DOC; };
export const isDocumentJSONNode = (node: JSONNode): node is DocumentJSONNodeType => node.type === NodeName.DOC;

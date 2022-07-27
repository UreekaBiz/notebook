import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { NodeRendererSpec } from '../htmlRenderer/type';
import { JSONNode, NodeGroup, NodeName } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
export type DocumentAttributes = {/*no attributes*/};

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const DocumentNodeSpec: NodeSpec = {
  name: NodeName.DOC/*expected and guaranteed to be unique*/,

  // NOTE: Is expected that the schema using this node explicitly defines that this
  //       is the top node.
  // SEE:  src/common/notebookEditor/schema.ts
  topNode: true/*it's the node that will be used as a root for the document*/,
  content: `${NodeGroup.BLOCK}+`,
};

// -- Render Spec -----------------------------------------------------------------
export const DocumentNodeRendererSpec: NodeRendererSpec<DocumentAttributes> = {
  tag: 'div',

  attributes: {/*no attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type DocumentNodeType = ProseMirrorNode<NotebookSchemaType> & {/*nothing additional*/};
export const isDocumentNode = (node: ProseMirrorNode<NotebookSchemaType>): node is DocumentNodeType => node.type.name === NodeName.DOC;

// -- JSON Node Type --------------------------------------------------------------
export type DocumentJSONNodeType = JSONNode<DocumentAttributes> & { type: NodeName.DOC; };
export const isDocumentJSONNode = (node: JSONNode): node is DocumentJSONNodeType => node.type === NodeName.DOC;


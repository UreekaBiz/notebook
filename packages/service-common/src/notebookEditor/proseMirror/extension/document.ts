import { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { NodeRendererSpec } from '../htmlRenderer/type';
import { NodeName, NodeType } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// -- Node Spec -------------------------------------------------------------------
export const DocumentNodeSpec: NodeSpec = {
  name: NodeName.DOC,

  topNode: true,
  content: `${NodeType.BLOCK}+`,
};

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type DocumentNodeType = ProseMirrorNode<NotebookSchemaType> & {/*nothing additional*/};
export const isDocumentNode = (node: ProseMirrorNode<NotebookSchemaType>): node is DocumentNodeType => node.type.name === NodeName.DOC;

// ================================================================================
// -- Render Spec -----------------------------------------------------------------
// TODO: Add DocumentAttributes
export const DocumentNodeRendererSpec: NodeRendererSpec = {
  tag: 'div',

  attributes: {/*no attributes*/},
};

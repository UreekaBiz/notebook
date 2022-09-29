import { Node as ProseMirrorNode } from 'prosemirror-model';

// ********************************************************************************
// NOTE  Attributes and methods that are common to all inline Nodes with Content
//       are located here
// NOTE: All functionality that is common to the inline Nodes with Content
//       themselves is located in the InlineNodeWithContent extension
//       (SEE: src/notebookEditor/extension/inlineNodeWithContent/InlineNodeWithContent.ts)

// -- Node Type -------------------------------------------------------------------
export const isInlineNodeWithContent = (node: ProseMirrorNode): boolean => node.isInline && !node.isText;

// == CSS =========================================================================
export const INLINE_NODE_CONTAINER_CLASS = 'inlineNodeContainer';

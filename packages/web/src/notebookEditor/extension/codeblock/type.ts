import { DEFAULT_NODE_ID } from 'notebookEditor/extension/uniqueNodeId/UniqueNodeId';

// ********************************************************************************
// == Type ========================================================================
export type VisualId = string/*alias*/;

// == Constant ====================================================================
export const DEFAULT_CODEBLOCK_ID = `${DEFAULT_NODE_ID} CodeBlock ID`;
export const EMPTY_CODEBLOCK_HASH = 'EmptyString'/*used as the hash when a CodeBlock is empty*/;

import { Node as ProseMirrorNode } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { NodeName } from '../node';
import { NotebookSchemaType } from '../schema';
import { createDefaultAsyncNodeAttributes, AsyncNodeAttributeSpec, DEFAULT_ASYNC_NODE_STATUS } from './asyncNode';
import { CodeBlockHash } from './codeBlock';
import { CodeBlockReference } from './codeBlockReference';

// ********************************************************************************
// NOTE: codeBlockAsyncNodes are meant to be an abstraction for all async nodes
//       whose behavior relates to codeBlocks. As such, any attributes that are
//       common to all of them is here
// NOTE: All functionality that is common to the codeBlockAsyncNodes themselves is
//       located in the codeBlockAsyncNode extension
//       (SEE: src/notebookEditor/extension/codeBlockAsyncNode/CodeBlockAsyncNode)

// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Node
export const CodeBlockAsyncNodeAttributeSpec = {
  ...AsyncNodeAttributeSpec,

  /** The array of nodeIdentifiers that the async node is listening to */
  [AttributeType.CodeBlockReferences]: noNodeOrMarkSpecAttributeDefaultValue<CodeBlockReference[]>(),

  /** The array of strings containing the hashes of the textContent of each corresponding CodeBlockReference*/
  [AttributeType.CodeBlockHashes]: noNodeOrMarkSpecAttributeDefaultValue<CodeBlockHash[]>(),

  /** The resulting value of the executed function */
  [AttributeType.Text]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type CodeBlockAsyncNodeAttributes = AttributesTypeFromNodeSpecAttributes<typeof CodeBlockAsyncNodeAttributeSpec>;
export const isCodeBlockAsyncNodeAttributes = (attrs: any): attrs is CodeBlockAsyncNodeAttributes => 'codeBlockReferences' in attrs && 'codeBlockHashes' in attrs;

// == Type ========================================================================
// the set of Node 'types' that are codeBlockAsyncNodes (the 'inclusion set')
export const codeBlockAsyncNodes: Set<NodeName> = new Set([NodeName.DEMO_ASYNC_NODE]);

export const DEFAULT_CODEBLOCK_ASYNC_NODE_ID = `Default CodeBlockAsyncNode ID`;
export const DEFAULT_CODEBLOCK_ASYNC_NODE_STATUS = DEFAULT_ASYNC_NODE_STATUS/*alias*/;

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type CodeBlockAsyncNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: CodeBlockAsyncNodeAttributes; };
export const isCodeBlockAsyncNode = (node: ProseMirrorNode<NotebookSchemaType>): node is CodeBlockAsyncNodeType => codeBlockAsyncNodes.has(node.type.name as NodeName/*by definition*/);

// == Util ========================================================================
export const createDefaultCodeBlockAsyncNodeAttributes = (): Partial<CodeBlockAsyncNodeAttributes> =>
({
  ...createDefaultAsyncNodeAttributes(),

  [AttributeType.Id]: DEFAULT_CODEBLOCK_ASYNC_NODE_ID,
  [AttributeType.CodeBlockReferences]: [/*initially empty*/],
  [AttributeType.CodeBlockHashes]: [/*initially empty*/],
});

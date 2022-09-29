import { Node as ProseMirrorNode } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { generateNodeId, NodeIdentifier, NodeName } from '../node';

// ********************************************************************************
// NOTE: AsyncNodes are meant to be an abstraction for all async nodes. As such,
//       any attributes that are common to all of them is here
// NOTE: All functionality that is common to the asyncNodes themselves is
//       located in the asyncNode extension
//       (SEE: src/notebookEditor/extension/asyncNode/AsyncNode.ts)

// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Node
export const AsyncNodeAttributeSpec = {
  [AttributeType.Id]: noNodeOrMarkSpecAttributeDefaultValue<NodeIdentifier>(),

  /** The {@link AsyncNodeStatus} the async node currently has */
  [AttributeType.Status]: noNodeOrMarkSpecAttributeDefaultValue<AsyncNodeStatus>(),
};
export type AsyncNodeAttributes = AttributesTypeFromNodeSpecAttributes<typeof AsyncNodeAttributeSpec>;
export const isAsyncNodeAttributes = (attrs: any): attrs is AsyncNodeAttributes => attrs.status !== undefined;

// == Type ========================================================================
// the set of Node 'types' that are async nodes (the 'inclusion set')
export const asyncNodes: Set<NodeName> = new Set([NodeName.DEMO_ASYNC_NODE]);

export enum AsyncNodeStatus {
  NEVER_EXECUTED = 'neverExecuted',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export const DEFAULT_ASYNC_NODE_ID = `Default AsyncNode ID`;
export const DEFAULT_ASYNC_NODE_STATUS = AsyncNodeStatus.NEVER_EXECUTED;
export const DEFAULT_ASYNC_NODE_EDITABLE = true;

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type AsyncNodeType = ProseMirrorNode & { attrs: AsyncNodeAttributes; };
export const isAsyncNode = (node: ProseMirrorNode): node is AsyncNodeType => asyncNodes.has(node.type.name as NodeName/*by definition*/);

// == Util ========================================================================
export const asyncNodeStatusToColor = (status: AsyncNodeStatus): string => {
  switch(status) {
    case AsyncNodeStatus.NEVER_EXECUTED:
      return 'gray';
    case AsyncNodeStatus.PROCESSING:
      return 'yellow';
    case AsyncNodeStatus.SUCCESS:
      return 'green';
    case AsyncNodeStatus.ERROR:
      return 'red';
  }
};

export const createDefaultAsyncNodeAttributes = (): AsyncNodeAttributes =>
({
  [AttributeType.Id]: generateNodeId()/*unique for each invocation*/,
  [AttributeType.Status]: DEFAULT_ASYNC_NODE_STATUS,
});

// == CSS =========================================================================
export const ASYNC_NODE_DIRTY_DATATYPE = 'data-async-node-dirty';

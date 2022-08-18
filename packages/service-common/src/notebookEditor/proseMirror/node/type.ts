import { customAlphabet } from 'nanoid';
import { Fragment, Node as ProseMirrorNode, Schema } from 'prosemirror-model';

import { Attributes, AttributeType } from '../attribute';
import { JSONMark } from '../mark';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Node Definition =============================================================
export type NodeIdentifier = string/*alias*/;

// --------------------------------------------------------------------------------
/** Unique identifier for each Node on the schema */
export enum NodeName {
  CODEBLOCK = 'codeBlock',
  CODEBLOCK_REFERENCE = 'codeBlockReference',
  DEMO_ASYNC_NODE = 'demoAsyncNode',
  DEMO_2_ASYNC_NODE = 'demo2AsyncNode',
  DOC = 'document',
  HEADING = 'heading',
  IMAGE = 'image',
  MARK_HOLDER = 'markHolder',
  PARAGRAPH = 'paragraph',
  TEXT = 'text',
}
export const getNodeName = (node: ProseMirrorNode) => node.type.name as NodeName;
export const isNodeType = (node: ProseMirrorNode, nodeName: NodeName) => node.type.name === nodeName;

/** The type of group that this Node belongs to. This is used on the Content field
 *  on a NodeSpec */
// NOTE: when using a custom group type it is expected to be defined here with a
//       explicit description on where and why it is used. This is done to help
//       prevent inconsistencies between the content of a node and the Group it
//       belongs to.
export enum NodeGroup {
  BLOCK = 'block',
  INLINE = 'inline',
}

/** the HTML tag used when rendering the node to the DOM */
export type NodeTag = string/*alias*/;

// == JSON ========================================================================
/** JSON representation of a ProseMirror Node */
export type JSONNode<A extends Attributes = {}> = {
  type: NodeName;
  content?: JSONNode[];
  text?: string;

  // Attributes are not required in a node and potentially not be present.
  attrs?: Partial<A>;
  marks?: JSONMark[];
};
/** Stringified version of the content of the Node */
export type NodeContent = string/*alias*/;

/** Type of ProseMirror Node Content when creating Nodes or Marks from a Node or Mark type */
export type ProseMirrorNodeContent = Fragment<NotebookSchemaType> | ProseMirrorNode<NotebookSchemaType> | ProseMirrorNode<NotebookSchemaType>[];

// --------------------------------------------------------------------------------
export const nodeToJSONNode = (node: ProseMirrorNode) => node.toJSON() as JSONNode;
export const nodeToContent = (node: ProseMirrorNode<Schema>) => JSON.stringify(nodeToJSONNode(node)) as NodeContent;
export const contentToJSONNode = (content: NodeContent) => JSON.parse(content) as JSONNode/*FIXME: handle exceptions!!!*/;
export const contentToNode = (schema: Schema, content?: NodeContent) => content ? ProseMirrorNode.fromJSON(schema, contentToJSONNode(content)) : undefined/*none*/;

// == Unique Node Id ==============================================================
// NOTE: at a minimum the id must be URL-safe (i.e. without the need to URL encode)
// NOTE: this is expected to be used within a given context (e.g. within a document)
//       and therefore does not need to have as much randomness as, say, UUIDv4
const customNanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10/*T&E*/);
export const generateNodeId = () => customNanoid();

/**
 * Computes the corresponding id that the tag for a Node will receive if needed.
 * Note that not all nodes require their view to have an ID, but all nodeViews
 * whose nodes make use of this functionality -must- have an ID attribute.
 */
 export const nodeToTagId = (node: ProseMirrorNode) => `${node.type.name}-${node.attrs[AttributeType.Id]}`;

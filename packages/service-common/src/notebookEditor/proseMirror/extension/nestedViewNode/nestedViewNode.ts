import { Node as ProseMirrorNode } from 'prosemirror-model';

import { createNodeDataTypeAttribute } from '../../../../notebookEditor/proseMirror/htmlRenderer/type';
import { noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../../attribute';
import { NodeName } from '../../node';
import { EditableInlineNodeWithContentNodeType } from './editableInlineNodeWithContent';
import { NestedViewBlockNodeType } from './nestedViewBlockNode';

// ********************************************************************************
// NOTE: nestedViewNodes are meant to be an abstraction for Inline or Block Nodes
//       whose functionality involves a nested EditorView.
// NOTE: All functionality that is common to them is located in the
//       NestedViewNode extension
//       (SEE: src/notebookEditor/extension/codeBlockAsyncNode/NestedViewNode)

// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Node
export const NestedViewNodeNodeAttributeSpec = {
  [AttributeType.Id]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type NestedViewNodeAttributes = AttributesTypeFromNodeSpecAttributes<typeof NestedViewNodeNodeAttributeSpec>;
export const isNestedViewNodeAttributes = (attrs: any): attrs is NestedViewNodeAttributes => 'id' in attrs;

// == Type ========================================================================
// the set of Node 'types' that are NestedViewNodes (the 'inclusion set')
export const nestedViewNodes: Set<NodeName> = new Set([NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT, NodeName.NESTED_VIEW_BLOCK_NODE]);

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type NestedViewNodeType = ProseMirrorNode & { attrs: NestedViewNodeAttributes; };
export const isNestedViewNode = (node: ProseMirrorNode): node is NestedViewNodeType => nestedViewNodes.has(node.type.name as NodeName/*by definition*/);

// == Util ========================================================================
/**
 * compute the length of the shown textString for
 * the given NestedViewNode
 */
 export const getNestedViewNodeTextString = (node: EditableInlineNodeWithContentNodeType | NestedViewBlockNodeType) => {
  const { textContent } = node;
  let texString = '';
  if(textContent && textContent.length > 0) {
    texString = textContent.trim();
  } /* else -- check for emptiness */

  return texString;
};

// returns the renderer View string for a NestedViewNode
export const createNestedViewNodeRenderedView = (nodeName: NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT | NodeName.NESTED_VIEW_BLOCK_NODE, content: string) => {
  // NOTE: must not contain white space, else the renderer has issues
  //       (hence it is a single line below)
  // NOTE: createNodeDataTypeAttribute must be used for all nodeRenderSpecs
  //       that define their own renderNodeView
  const isEmpty = content.length < 1;
  return `<span ${createNodeDataTypeAttribute(nodeName)} class="${isEmpty ? NESTED_VIEW_NODE_EMPTY_NODE_CLASS : ''/*none*/}"><span class="${NESTED_NODE_VIEW_RENDER_DISPLAY_CONTAINER_CLASS}">Length: ${(content.length)}</span></span>`;
};

// .. CSS .........................................................................
export const NESTED_NODE_VIEW_RENDER_DISPLAY_CONTAINER_CLASS = 'renderedViewDisplay'/*T&E*/;
export const NESTED_NODE_VIEW_INNER_VIEW_DISPLAY_CONTAINER_CLASS = 'innerViewDisplay'/*T&E*/;

export const NESTED_VIEW_NODE_EMPTY_NODE_CLASS = 'emptyNVN';

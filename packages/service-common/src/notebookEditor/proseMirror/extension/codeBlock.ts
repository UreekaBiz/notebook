import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { getWrapStyles, noNodeOrMarkSpecAttributeDefaultValue, AttributeType, AttributesTypeFromNodeSpecAttributes } from '../attribute';
import { getRenderAttributes } from '../htmlRenderer/attribute';
import { RendererState } from '../htmlRenderer/state';
import { createNodeDataAttribute, createNodeDataTypeAttribute, NodeRendererSpec } from '../htmlRenderer/type';
import { getAllowedMarks, MarkName } from '../mark';
import { JSONNode, NodeGroup, NodeIdentifier, NodeName, ProseMirrorNodeContent } from '../node';
import { NotebookSchemaType } from '../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: This values must have matching types the ones defined in the Extension.
const CodeBlockAttributesSpec = {
  [AttributeType.Id]: noNodeOrMarkSpecAttributeDefaultValue<NodeIdentifier>(),

  /** a ContentType-like string that defines what code is in the CodeBlock */
  [AttributeType.Type]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  /** does the text wrap within the CodeBlock */
  [AttributeType.Wrap]: noNodeOrMarkSpecAttributeDefaultValue<boolean>(),

  [AttributeType.PaddingTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.PaddingRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),

  [AttributeType.MarginTop]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginBottom]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
  [AttributeType.MarginLeft]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
[AttributeType.MarginRight]: noNodeOrMarkSpecAttributeDefaultValue<string>(),
};
export type CodeBlockAttributes = AttributesTypeFromNodeSpecAttributes<typeof CodeBlockAttributesSpec>;

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const CodeBlockNodeSpec: NodeSpec = {
  name: NodeName.CODEBLOCK,

  content: `${NodeName.TEXT}*`,
  marks: getAllowedMarks([MarkName.BOLD, MarkName.STRIKETHROUGH]),

  group: NodeGroup.BLOCK,
  defining: true/*important parent node during replace operations, parent of content preserved on replace operations*/,
  code: true/*indicate that the block contains code, which causes some commands (e.g. enter) to behave differently*/,
  allowGapCursor: true,

  attrs: CodeBlockAttributesSpec,
};

// -- Render Spec -----------------------------------------------------------------
const renderCodeBlockNodeView = (attributes: CodeBlockAttributes, content: string, state: RendererState) => {
  const id = attributes[AttributeType.Id];
  const visualId = id ? state[NodeName.CODEBLOCK].visualIds[id] : ''/*no visual id*/;
  const isWrap = !!attributes[AttributeType.Wrap];

  const renderAttributes = getRenderAttributes(NodeName.CODEBLOCK, { ...attributes, [AttributeType.Wrap]: ''/*string required -- ignore value*/ }, CodeBlockNodeRendererSpec, CodeBlockNodeSpec);

  // CHECK: is there any reason this can't use JSX to define the structure?
  // NOTE: must not contain white space, else the renderer has issues
  //       (hence it is a single line below)
  // NOTE: createNodeDataTypeAttribute must be used for all nodeRenderSpecs
  //       that define their own renderNodeView
  return `<div id=${id} ${createNodeDataTypeAttribute(NodeName.CODEBLOCK)} ${createNodeDataAttribute(AttributeType.Type)}="${attributes.type}" ${DATA_VISUAL_ID}="${visualId}" style="${renderAttributes.style ?? ''/*empty string if not defined*/}"><div><p style="${getWrapStyles(isWrap)}">${content}</p></div></div>`;
};

export const CodeBlockNodeRendererSpec: NodeRendererSpec<CodeBlockAttributes> = {
  tag: 'div',

  isNodeViewRenderer: true/*by definition*/,
  renderNodeView: renderCodeBlockNodeView,

  attributes: {/*no need to render attributes*/},
};

// == Type ========================================================================
// alias for the hash of the Content of a CodeBlock
export type CodeBlockHash = string;

// the attribute that ensures that VisualId for a CodeBlock appears
// to the right of the CodeBlock (SEE: index.css)
export const DATA_VISUAL_ID = 'data-visualid';

// the text that gets shown for Chips when the corresponding
// codeBlock gets removed, hence invalidating its visualId
export const REMOVED_CODEBLOCK_VISUALID = 'Removed';

// used as the hash when a CodeBlock is empty
export const EMPTY_CODEBLOCK_HASH = 'EmptyString';

export enum CodeBlockType { Text = 'Text', Code = 'Code'}
export const isCodeBlockAttributes = (attrs: any): attrs is CodeBlockAttributes => attrs.id !== undefined;

// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way to ensure the right attributes will be available
//       since PM does not provide a way to specify their type
export type CodeBlockNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: CodeBlockAttributes; };
export const isCodeBlockNode = (node: ProseMirrorNode<NotebookSchemaType>): node is CodeBlockNodeType => node.type.name === NodeName.CODEBLOCK;

export const getCodeBlockNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.CODEBLOCK];
export const createCodeBlockNode = (schema: NotebookSchemaType, attributes?: Partial<CodeBlockAttributes>, content?: ProseMirrorNodeContent, marks?: Mark<NotebookSchemaType>[]) =>
  getCodeBlockNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type CodeBlockJSONNodeType = JSONNode<CodeBlockAttributes> & { type: NodeName.CODEBLOCK; };
export const isCodeBlockJSONNode = (node: JSONNode): node is CodeBlockJSONNodeType => node.type === NodeName.CODEBLOCK;

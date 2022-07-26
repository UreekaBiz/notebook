import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';

import { createApplicationError } from '../../util/error';
import { BlockquoteNodeSpec } from './extension/blockquote';
import { BoldMarkSpec } from './extension/bold';
import { CodeMarkSpec } from './extension/code';
import { CodeBlockNodeSpec } from './extension/codeBlock';
import { CodeBlockReferenceNodeSpec } from './extension/codeBlockReference';
import { Demo2AsyncNodeSpec } from './extension/demo2AsyncNode';
import { DemoAsyncNodeSpec } from './extension/demoAsyncNode';
import { DocumentNodeSpec } from './extension/document';
import { HeadingNodeSpec } from './extension/heading';
import { HorizontalRuleNodeSpec } from './extension/horizontalRule';
import { ImageNodeSpec } from './extension/image';
import { ItalicMarkSpec } from './extension/italic';
import { LinkMarkSpec } from './extension/link';
import { BulletListNodeSpec, ListItemContentNodeSpec, ListItemNodeSpec, OrderedListNodeSpec, TaskListItemNodeSpec, TaskListNodeSpec } from './extension/list';
import { MarkHolderNodeSpec } from './extension/markHolder';
import { EditableInlineNodeWithContentNodeSpec, NestedViewBlockNodeSpec } from './extension/nestedViewNode';
import { ParagraphNodeSpec } from './extension/paragraph';
import { ReplacedTextMarkMarkSpec } from './extension/replacedTextMark';
import { StrikethroughMarkSpec } from './extension/strikethrough';
import { SubScriptMarkRendererSpec } from './extension/subScript';
import { SuperScriptMarkRendererSpec } from './extension/superScript';
import { TextNodeSpec } from './extension/text';
import { TextStyleMarkSpec } from './extension/textStyle';
import { UnderlineMarkSpec } from './extension/underline';
import { MarkName } from './mark';
import { NodeName } from './node';

// ********************************************************************************
// == Spec ========================================================================
export const NodeSpecs: Record<NodeName, NodeSpec> = {
  // NOTE: the order must match the order defined in ExtensionPriority for Nodes
  //       and Marks so that the resulting Schema priorities follow the same
  //       hierarchy as the web-package (note that Doc is at the top even if not
  //       specified in ExtensionPriority)
  //       (SEE: web/src/notebookEditor/model/type/ExtensionPriority.ts)
  [NodeName.DOC]: DocumentNodeSpec,
  [NodeName.PARAGRAPH]: ParagraphNodeSpec,
  [NodeName.LIST_ITEM_CONTENT]: ListItemContentNodeSpec,
  [NodeName.LIST_ITEM]: ListItemNodeSpec,
  [NodeName.TASK_LIST_ITEM]: TaskListItemNodeSpec,

  [NodeName.BLOCKQUOTE]: BlockquoteNodeSpec,
  [NodeName.BULLET_LIST]: BulletListNodeSpec,
  [NodeName.CODEBLOCK]: CodeBlockNodeSpec,
  [NodeName.CODEBLOCK_REFERENCE]: CodeBlockReferenceNodeSpec,
  [NodeName.DEMO_2_ASYNC_NODE]: Demo2AsyncNodeSpec,
  [NodeName.DEMO_ASYNC_NODE]: DemoAsyncNodeSpec,
  [NodeName.EDITABLE_INLINE_NODE_WITH_CONTENT]: EditableInlineNodeWithContentNodeSpec,
  [NodeName.HEADING]: HeadingNodeSpec,
  [NodeName.HORIZONTAL_RULE]: HorizontalRuleNodeSpec,
  [NodeName.IMAGE]: ImageNodeSpec,
  [NodeName.MARK_HOLDER]: MarkHolderNodeSpec,
  [NodeName.NESTED_VIEW_BLOCK_NODE]: NestedViewBlockNodeSpec,
  [NodeName.ORDERED_LIST]: OrderedListNodeSpec,
  [NodeName.TASK_LIST]: TaskListNodeSpec,
  [NodeName.TEXT]: TextNodeSpec,
};

export const MarkSpecs: Record<MarkName, MarkSpec> = {
  [MarkName.LINK]: LinkMarkSpec,

  [MarkName.BOLD]: BoldMarkSpec,
  [MarkName.CODE]: CodeMarkSpec,
  [MarkName.ITALIC]: ItalicMarkSpec,
  [MarkName.REPLACED_TEXT_MARK]: ReplacedTextMarkMarkSpec,
  [MarkName.STRIKETHROUGH]: StrikethroughMarkSpec,
  [MarkName.SUB_SCRIPT]: SubScriptMarkRendererSpec,
  [MarkName.SUPER_SCRIPT]: SuperScriptMarkRendererSpec,
  [MarkName.TEXT_STYLE]: TextStyleMarkSpec,
  [MarkName.UNDERLINE]: UnderlineMarkSpec,
};

// == Schema ======================================================================
/** the schema version of the {@link Notebook}
  *  @see Notebook#schemaVersion */
// NOTE: must be updated when adding breaking changes to the Schema Notebook
export enum NotebookSchemaVersion {
  V1 = 'v1'/*initial version -- no longer used*/,
  V2 = 'v2'/*moved away from 'steps' and confusion around 'version' (schema vs. PM 'step'), etc*/,
}
export const NotebookSchemaVersionLatest = NotebookSchemaVersion.V2;

// ................................................................................
// NOTE: this schema must reflect the same Schema that is being used in the Editor
//       itself, otherwise the Editor will not be able to load the Document.
//
//       When adding or removing Nodes, the extensions that are used in the Editor
//       must also be updated to match the new Schema
// SEE: NotebookProvider.ts
export const SchemaV2 = new Schema({
  topNode: NodeName.DOC,

  nodes: NodeSpecs,

  marks: MarkSpecs,
});
export type NotebookSchemaType = typeof SchemaV2;

// ================================================================================
export const getSchema = (schemaVersion: NotebookSchemaVersion): Schema => {
  switch(schemaVersion) {
    case NotebookSchemaVersion.V1: throw createApplicationError('devel/unhandled', `Notebook schema version '${schemaVersion}' no longer supported.`);
    case NotebookSchemaVersion.V2: return SchemaV2;

    default: throw createApplicationError('devel/unhandled', `Notebook schema version '${schemaVersion}' doesn't have a corresponding schema.`)/*no version was found*/;
  }
};

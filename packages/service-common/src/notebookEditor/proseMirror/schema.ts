import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';

import { createApplicationError } from '../../util/error';
import { BoldMarkSpec } from './extension/bold';
import { DocumentNodeSpec } from './extension/document';
import { HeadingNodeSpec } from './extension/heading';
import { ImageNodeSpec } from './extension/image';
import { ParagraphNodeSpec } from './extension/paragraph';
import { StrikethroughMarkSpec } from './extension/strikethrough';
import { TextNodeSpec } from './extension/text';
import { TextStyleMarkSpec } from './extension/textStyle';
import { TitleNodeRendererSpec } from './extension/title';
import { MarkName } from './mark';
import { NodeName } from './node';

// ********************************************************************************
// ================================================================================
export const NodeSpecs: Record<NodeName, NodeSpec> = {
  [NodeName.DOC]: DocumentNodeSpec,
  [NodeName.HEADING]: HeadingNodeSpec,
  [NodeName.IMAGE]: ImageNodeSpec,
  [NodeName.PARAGRAPH]: ParagraphNodeSpec,
  [NodeName.TEXT]: TextNodeSpec,
  [NodeName.TITLE]: TitleNodeRendererSpec,
};

export const MarkSpecs: Record<MarkName, MarkSpec> = {
  [MarkName.BOLD]: BoldMarkSpec,
  [MarkName.STRIKETHROUGH]: StrikethroughMarkSpec,
  [MarkName.TEXT_STYLE]: TextStyleMarkSpec,
};

// == Schema ======================================================================
/** the schema version of the {@link Notebook}
  *  @see Notebook#schemaVersion */
// NOTE: must be updated when adding breaking changes to the Schema Notebook
export enum NotebookSchemaVersion {
  V1 = 'v1'/*initial version -- no longer used*/,
  V2 = 'v2'/*moved away from 'steps' and confusion around 'version' (schema vs. PM 'step'), etc*/,
}

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

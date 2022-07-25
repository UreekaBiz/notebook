import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';

import { NotebookSchemaVersion } from '../../notebook/type';
import { createApplicationError } from '../../util/error';
import { BoldMarkSpec } from './extension/bold';
import { DocumentNodeSpec } from './extension/document';
import { HeadingNodeSpec } from './extension/heading';
import { ParagraphNodeSpec } from './extension/paragraph';
import { TextNodeSpec } from './extension/text';
import { TextStyleMarkSpec } from './extension/textStyle';
import { MarkName } from './mark';
import { NodeName } from './node';

// ********************************************************************************
// ================================================================================
export const NodeSpecs: Record<NodeName, NodeSpec> = {
  [NodeName.DOC]: DocumentNodeSpec,
  [NodeName.HEADING]: HeadingNodeSpec,
  [NodeName.PARAGRAPH]: ParagraphNodeSpec,
  [NodeName.TEXT]: TextNodeSpec,
};

export const MarkSpecs: Record<MarkName, MarkSpec> = {
  [MarkName.BOLD]: BoldMarkSpec,
  [MarkName.TEXT_STYLE]: TextStyleMarkSpec,
};

// == Schema ======================================================================
// NOTE: This schema must reflect the same schema that is being used in the editor
//       itself, otherwise the editor will not be able to load the document.
//
//       When adding or removing nodes, the extensions that are used in the editor
//       must also be updated to match the new schema
// SEE: @web:/notebookEditor/context/NotebookProvider.ts
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

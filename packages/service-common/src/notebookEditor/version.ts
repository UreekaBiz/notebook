import { Step as ProseMirrorStep } from 'prosemirror-transform';

import { getSchema, NotebookSchemaVersion } from './proseMirror';
import { NotebookVersionContent } from './type';

// ********************************************************************************
// creates a ProseMirrorStep for the given Notebook Version content given the specified Schema
export const contentToStep = (schemaVersion: NotebookSchemaVersion, content: NotebookVersionContent): ProseMirrorStep => {
  const schema = getSchema(schemaVersion);
  const versionJson = JSON.parse(content)/*FIXME: contentToJson()?*//*FIXME: handle exceptions!*/;
  return ProseMirrorStep.fromJSON(schema, versionJson)/*FIXME: wrap and think about exception*/;
};

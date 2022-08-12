import { Step as ProseMirrorStep } from 'prosemirror-transform';

import { getSchema, NotebookSchemaVersion } from './proseMirror';
import { contentToJSONStep } from './proseMirror/step';
import { NotebookVersionContent } from './type';

// ********************************************************************************
// creates a ProseMirrorStep for the given Notebook Version content given the
// specified Schema
// SEE: @ureeka-notebook/web-service: /notebookEditor/VersionListener.ts
export const contentToStep = (schemaVersion: NotebookSchemaVersion, content: NotebookVersionContent): ProseMirrorStep => {
  const schema = getSchema(schemaVersion);
  return ProseMirrorStep.fromJSON(schema, contentToJSONStep(content));
};

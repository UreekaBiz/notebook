import { Schema } from 'prosemirror-model';
import { Step as ProseMirrorStep } from 'prosemirror-transform';

import { NotebookVersionContent } from './type';

// ********************************************************************************
// creates a ProseMirrorStep for the given Notebook Version content given the specified Schema
export const contentToStep = (schema: Schema, content: NotebookVersionContent): ProseMirrorStep => {
  const versionJson = JSON.parse(content)/*FIXME: contentToJson()?*//*FIXME: handle exceptions!*/;
  return ProseMirrorStep.fromJSON(schema, versionJson)/*FIXME: wrap and think about exception*/;
};

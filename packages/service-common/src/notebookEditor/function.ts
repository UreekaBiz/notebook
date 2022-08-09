import * as Validate from 'yup';

import { stringMedSchema } from '../util/schema';
import { Identifier_Schema } from '../util/type';

// ********************************************************************************
// == Notebook Editor =============================================================
// -- Commands --------------------------------------------------------------------
export const NotebookEditorInsertText_Rest_Schema = Validate.object({
  notebookId: Identifier_Schema
      .required(),

  text: stringMedSchema
      .required(),
}).noUnknown();
export type NotebookEditorInsertText_Rest = Validate.InferType<typeof NotebookEditorInsertText_Rest_Schema>;

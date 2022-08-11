import * as Validate from 'yup';

import { stringMedSchema, stringVLongSchema } from '../util/schema';
import { Identifier_Schema } from '../util/type';

// ********************************************************************************
// == Notebook Editor =============================================================
// -- Command ---------------------------------------------------------------------
export const NotebookEditorInsertNumbers_Rest_Schema = Validate.object({
    notebookId: Identifier_Schema
        .required(),
}).noUnknown();
export type NotebookEditorInsertNumbers_Rest = Validate.InferType<typeof NotebookEditorInsertNumbers_Rest_Schema>;

export const NotebookEditorInsertText_Rest_Schema = Validate.object({
  notebookId: Identifier_Schema
      .required(),

  text: stringMedSchema
      .required(),
}).noUnknown();
export type NotebookEditorInsertText_Rest = Validate.InferType<typeof NotebookEditorInsertText_Rest_Schema>;

// -- Execute ---------------------------------------------------------------------
export const NotebookEditorDemoAsyncNodeExecute_Rest_Schema = Validate.object({
  /** the {@link NotebookIdentifier} of the {@link Notebook} in which the D3AN is
   *  executed */
  notebookId: Identifier_Schema
      .required(),

  /** the unique {@link NodeIdentifier} for the D3AN that is being executed */
  nodeId: Identifier_Schema
      .required(),

  /** the combined content of all of the Code Blocks associated with the Node */
  content: stringVLongSchema
      .required(),

  /** the corresponding hashes in order of all of the CodeBLocks associated with
   *  the node */
  hashes: Validate.array()
      .of(stringMedSchema.required())
      .required(),
}).noUnknown();
export type NotebookEditorDemoAsyncNodeExecute_Rest = Readonly<Validate.InferType<typeof NotebookEditorDemoAsyncNodeExecute_Rest_Schema>>;

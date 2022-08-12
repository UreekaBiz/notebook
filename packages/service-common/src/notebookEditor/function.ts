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
  /** the {@link NotebookIdentifier} of the {@link Notebook} in which the DAN is
   *  executed */
  notebookId: Identifier_Schema
      .required(),

  /** the unique {@link NodeIdentifier} for the DAN that is being executed */
  nodeId: Identifier_Schema
      .required(),

  /** the corresponding hashes in order of all of the Code Blocks associated with
   *  the Node. This is used to define the (not) dirty state once execution is
   *  complete */
  hashes: Validate.array()
      .of(stringMedSchema.required())
      .required(),
  /** the combined content of all of the Code Blocks associated with the Node. This
   *  content must correspond to the text in the Code Blocks for which the hashes
   *  are provided */
  content: stringVLongSchema
      .required(),
}).noUnknown();
export type NotebookEditorDemoAsyncNodeExecute_Rest = Readonly<Validate.InferType<typeof NotebookEditorDemoAsyncNodeExecute_Rest_Schema>>;

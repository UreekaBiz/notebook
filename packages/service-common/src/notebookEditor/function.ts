import * as Validate from 'yup';

import { stringMedSchema, stringVLongSchema } from '../util/schema';
import { Identifier_Schema } from '../util/type';

// ********************************************************************************
// == Notebook Editor =============================================================
// -- DAN -------------------------------------------------------------------------
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

// -- D2AN ------------------------------------------------------------------------
export const NotebookEditorDemo2AsyncNodeExecute_Rest_Schema = Validate.object({
  /** the {@link NotebookIdentifier} of the {@link Notebook} in which the D2AN is
   *  executed */
  notebookId: Identifier_Schema
      .required(),

  /** the unique {@link NodeIdentifier} for the D2AN that is being executed */
  nodeId: Identifier_Schema
      .required(),

  /** the text content D2AN from which the text will be replaced */
  content: stringVLongSchema
      .required(),
  /** the text that is going to be replaced inside the content */
  replace: stringVLongSchema
      .required(),

}).noUnknown();
export type NotebookEditorDemo2AsyncNodeExecute_Rest = Readonly<Validate.InferType<typeof NotebookEditorDemo2AsyncNodeExecute_Rest_Schema>>;

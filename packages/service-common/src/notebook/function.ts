import * as Validate from 'yup';

import { mapValues } from '../util/object';
import { stringMedSchema } from '../util/schema';
import { Identifier_Schema, Modify } from '../util/type';
import { UserIdentifier } from '../util/user';
import { NotebookRole, NotebookType } from './type';

// ********************************************************************************
// == Notebook ====================================================================
// -- Create / Delete -------------------------------------------------------------
// .. Create ......................................................................
export const NotebookCreate_Rest_Schema = Validate.object({
  type: Validate.string()
      .oneOf(Object.values(NotebookType))
      .required(),

  name: stringMedSchema
      .required(),
}).noUnknown();
export type NotebookCreate_Rest = Readonly<Modify<Validate.InferType<typeof NotebookCreate_Rest_Schema>, {
  type: NotebookType/*explicit*/;
}>>;

// .. Delete ......................................................................
export const NotebookDelete_Rest_Schema = Validate.object({
  notebookId: Identifier_Schema
      .required(),
}).noUnknown();
export type NotebookDelete_Rest = Readonly<Validate.InferType<typeof NotebookDelete_Rest_Schema>>;

// -- Share -----------------------------------------------------------------------
export const NotebookShare_Rest_Schema = Validate.object({
  notebookId: Identifier_Schema
      .required(),

  userRoles: Validate.lazy(object => Validate.object(
      mapValues(object as Record<UserIdentifier, string>, () => Validate.string()
          .oneOf(Object.values(NotebookRole))
          .required(),
      ))),
}).noUnknown();
export type NotebookShare_Rest = Readonly<Modify<Validate.InferType<typeof NotebookShare_Rest_Schema>, {
  userRoles: Record<UserIdentifier, NotebookRole>/*explicit*/;
}>>;

// == Published Notebook ==========================================================
// -- Create ----------------------------------------------------------------------
export const PublishedNotebookCreate_Rest_Schema = Validate.object({
  notebookId: Identifier_Schema
      .required(),
  // FIXME: rename to 'versionIndex' so as to distinguish from NotebookVersion
  version: Validate
      .number()
      .required(),

  title: stringMedSchema
      .required(),
  image: Validate.string(),
  snippet: stringMedSchema,
}).noUnknown();
export type PublishedNotebookCreate_Rest = Readonly<Validate.InferType<typeof PublishedNotebookCreate_Rest_Schema>>;

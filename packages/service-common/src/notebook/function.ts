import * as Validate from 'yup';

import { mapValues } from '../util/object';
import { stringMedSchema } from '../util/schema';
import { Identifier_Schema, Modify } from '../util/type';
import { UserIdentifier } from '../util/user';
import { NotebookRole, NotebookType, MAX_NOTEBOOK_HASHTAGS } from './type';

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
export type NotebookCreate_Rest = Modify<Validate.InferType<typeof NotebookCreate_Rest_Schema>, Readonly<{
  type: NotebookType/*explicit*/;
}>>;

// .. Delete ......................................................................
export const NotebookDelete_Rest_Schema = Validate.object({
  notebookId: Identifier_Schema
      .required(),
}).noUnknown();
export type NotebookDelete_Rest = Readonly<Validate.InferType<typeof NotebookDelete_Rest_Schema>>;

// -- Hashtag ---------------------------------------------------------------------
export const NotebookHashtag_Rest_Schema = Validate.object({
  notebookId: Identifier_Schema
      .required(),

  /** set of normalized hashtags associated with Published Notebook. If any hashtags
   *  are not normalized then they will be normalized and deduplicated */
  hashtags: Validate.array()
      .of(stringMedSchema.required())
      .max(MAX_NOTEBOOK_HASHTAGS)
      .required(),
}).noUnknown();
export type NotebookHashtag_Rest = Validate.InferType<typeof NotebookHashtag_Rest_Schema>;

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
export type NotebookShare_Rest = Modify<Validate.InferType<typeof NotebookShare_Rest_Schema>, Readonly<{
  userRoles: Record<UserIdentifier, NotebookRole>/*explicit*/;
}>>;

// -- Publish ---------------------------------------------------------------------
export const NotebookPublish_Rest_Schema = Validate.object({
  notebookId: Identifier_Schema
      .required(),

  versionIndex: Validate.number()
      .required(),

  title: stringMedSchema
      .required(),
  image: Validate.string()
      .notRequired(),
  snippet: stringMedSchema
      .notRequired(),
}).noUnknown();
export type NotebookPublish_Rest = Readonly<Validate.InferType<typeof NotebookPublish_Rest_Schema>>;

// == Notebook Published ==========================================================
// SEE: NotebookPublish_Rest_Schema

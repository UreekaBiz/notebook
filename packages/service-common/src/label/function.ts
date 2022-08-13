import * as Validate from 'yup';

import { NotebookIdentifier } from '../notebook/type';
import { mapValues } from '../util/object';
import { stringMedSchema } from '../util/schema';
import { ShareRole } from '../util/share';
import { Identifier_Schema, Modify } from '../util/type';
import { UserIdentifier } from '../util/user';
import { LabelVisibility, MAX_LABEL_NOTEBOOKS } from './type';

// ********************************************************************************
// == Label =======================================================================
// -- CUD -------------------------------------------------------------------------
// .. Create ......................................................................
export const LabelCreate_Rest_Schema = Validate.object({
  name: stringMedSchema
      .min(1/*cannot be blank*/)
      .required(),

  visibility: Validate.string()
      .oneOf(Object.values(LabelVisibility))
      .required(),

  ordered: Validate.bool()
      .required(),
}).noUnknown();
export type LabelCreate_Rest = Modify<Validate.InferType<typeof LabelCreate_Rest_Schema>, Readonly<{
  visibility: LabelVisibility/*explicit*/;
}>>;

// .. Update ......................................................................
export const LabelUpdate_Rest_Schema = Validate.object({
  labelId: Identifier_Schema
      .required(),
}).concat(LabelCreate_Rest_Schema).noUnknown();
export type LabelUpdate_Rest = Modify<Validate.InferType<typeof LabelUpdate_Rest_Schema>, Readonly<{
  visibility: LabelVisibility/*explicit*/;
}>>;

// .. Delete ......................................................................
export const LabelDelete_Rest_Schema = Validate.object({
  labelId: Identifier_Schema
      .required(),
}).noUnknown();
export type LabelDelete_Rest = Readonly<Validate.InferType<typeof LabelDelete_Rest_Schema>>;

// -- Notebook --------------------------------------------------------------------
// .. Add .........................................................................
export const LabelNotebookAdd_Rest_Schema = Validate.object({
  labelId: Identifier_Schema
      .required(),

  notebookId: Identifier_Schema
      .required(),
}).noUnknown();
export type LabelNotebookAdd_Rest = Readonly<Validate.InferType<typeof LabelNotebookAdd_Rest_Schema>>;

// .. Remove ......................................................................
export const LabelNotebookRemove_Rest_Schema = LabelNotebookAdd_Rest_Schema/*same structure*/;
export type LabelNotebookRemove_Rest = Readonly<Validate.InferType<typeof LabelNotebookRemove_Rest_Schema>>;

// .. Re-Order ....................................................................
// ordering a Label's Notebooks is always a separate and distinct operation therefore
// it is a separate REST operation
export const LabelNotebookReorder_Rest_Schema = Validate.object({
  labelId: Identifier_Schema
      .required(),

  /** the full ordered collection of Notebooks. This can be used to both add and
   *  remove Notebooks as well. */
  order: Validate.array()
      .of(Identifier_Schema.required())/*specifically Notebook identifiers*/
      .max(MAX_LABEL_NOTEBOOKS)
      .required(),
}).noUnknown();
export type LabelNotebookReorder_Rest = Modify<Validate.InferType<typeof LabelNotebookReorder_Rest_Schema>, Readonly<{
  order: NotebookIdentifier[]/*explicit*/;
}>>;

// -- Share -----------------------------------------------------------------------
export const LabelShare_Rest_Schema = Validate.object({
  labelId: Identifier_Schema
      .required(),

  userRoles: Validate.lazy(object => Validate.object(
      mapValues(object as Record<UserIdentifier, string>, () => Validate.string()
          .oneOf(Object.values(ShareRole))
          .required()
      ))),
}).noUnknown();
export type LabelShare_Rest = Modify<Validate.InferType<typeof LabelShare_Rest_Schema>, Readonly<{
  userRoles: Record<UserIdentifier, ShareRole>/*explicit*/;
}>>;

// == Label Published =============================================================
// when a Label's visibility is set to 'public' then it is Published. When a Label's
// visibility is set to 'private' then it is Unpublished (Label Published is deleted).

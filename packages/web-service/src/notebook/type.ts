import { OrderByDirection } from 'firebase/firestore';

import { FieldValue, Notebook, NotebookCreate_Rest, NotebookCreate_Rest_Schema, NotebookDelete_Rest, NotebookDelete_Rest_Schema, PublishedNotebook, PublishedNotebookCreate_Rest, PublishedNotebookCreate_Rest_Schema, UserIdentifier } from '@ureeka-notebook/service-common';

// ** Service Common **************************************************************
export {
  getNotebookShareRoles,
  areNotebookShareRolesEqual,

  Notebook,
  NotebookIdentifier,
  NotebookRole,
  NotebookSchemaVersion,
  NotebookTuple,
  NotebookType,
  PublishedNotebook,
  PublishedNotebookIdentifier,
  PublishedNotebookTuple,

  MAX_NOTEBOOK_SHARE_USERS,
} from '@ureeka-notebook/service-common';

// ********************************************************************************
// == Notebook ==================================================================
// -- CUD -------------------------------------------------------------------------
export const Notebook_Create_Schema = NotebookCreate_Rest_Schema;
export type Notebook_Create = NotebookCreate_Rest;

export const Notebook_Delete_Schema = NotebookDelete_Rest_Schema;
export type Notebook_Delete = NotebookDelete_Rest;

export const PublishedNotebook_Create_Schema = PublishedNotebookCreate_Rest_Schema;
export type PublishedNotebook_Create = PublishedNotebookCreate_Rest;

// == Search ======================================================================
// -- Notebook --------------------------------------------------------------------
// TODO: actually want to sort by the youngest child!
export type NotebookSortField = keyof Pick<Notebook,
  | 'name'
  | 'createTimestamp'
  | 'createdBy'
>;
export type NotebookSort = Readonly<{
  /** the field being sorted on */
  field: NotebookSortField | FieldValue/*for FieldPath.documentId()*/;

  /** the sort order / direction */
  direction: OrderByDirection;
}>;

/** the resulting query is the 'AND' of each member but the 'OR' of any multi-valued
 *  filter */
export type NotebookFilter = Readonly<{
  // NOTE: this supports only *exact* *match*
  name?: string;

  /** only show entries that were created by this User */
  createdBy?: UserIdentifier;

  // .. Deleted ...................................................................
  /** also include (soft) deleted entries (`false` by default) */
  deleted?: boolean;

  /** include _only_ (soft) deleted entries (`false` by default). This implies
   *  {@link #deleted} is `true` (but specifically the value of {@link #deleted}
   *  is ignored if this is `true`). */
  onlyDeleted?: boolean;

  // .. Sort ......................................................................
  /** the sort order applied in the order specified. If unspecified the default
   *  sort order is by 'name' with direction 'asc' */
  sort?: NotebookSort[];
}>;

// -- Published Notebook ----------------------------------------------------------
// TODO: actually want to sort by the youngest child!
export type PublishedNotebookSortField = keyof Pick<PublishedNotebook,
  | 'title'
  | 'createTimestamp'
  | 'createdBy'
>;
export type PublishedNotebookSort = Readonly<{
  /** the field being sorted on */
  field: PublishedNotebookSortField | FieldValue/*for FieldPath.documentId()*/;

  /** the sort order / direction */
  direction: OrderByDirection;
}>;

/** the resulting query is the 'AND' of each member but the 'OR' of any multi-valued
 *  filter */
export type PublishedNotebookFilter = Readonly<{
  // NOTE: this supports only *exact* *match*
  title?: string;

  /** only show entries that were created by this User */
  createdBy?: UserIdentifier;

  // TODO: Not implemented yet!
  // .. Deleted ...................................................................
  /** also include (soft) deleted entries (`false` by default) */
  deleted?: boolean;

  // TODO: Not implemented yet!
  /** include _only_ (soft) deleted entries (`false` by default). This implies
   *  {@link #deleted} is `true` (but specifically the value of {@link #deleted}
   *  is ignored if this is `true`). */
  onlyDeleted?: boolean;

  // .. Sort ......................................................................
  /** the sort order applied in the order specified. If unspecified the default
   *  sort order is by 'name' with direction 'asc' */
  sort?: PublishedNotebookSort[];
}>;

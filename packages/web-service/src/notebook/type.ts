import { Notebook, NotebookCreate_Rest, NotebookCreate_Rest_Schema, NotebookDelete_Rest, NotebookDelete_Rest_Schema, NotebookPublished, NotebookPublish_Rest, NotebookPublish_Rest_Schema, UserIdentifier } from '@ureeka-notebook/service-common';

import { SortableFilter } from '../util/firestore';

// ** Service-Common **************************************************************
export {
  // SEE: @ureeka-notebook/service-common: notebook/util.ts
  getNotebookShareRoles,
  areNotebookShareRolesEqual,

  // SEE: @ureeka-notebook/service-common: notebook/type.ts
  Notebook,
  NotebookIdentifier,
  NotebookPublished,
  NotebookPublishedContent,
  NotebookPublishedTuple,
  NotebookRole,
  NotebookSchemaVersion,
  NotebookTuple,
  NotebookType,

  MAX_NOTEBOOK_SHARE_USERS,
} from '@ureeka-notebook/service-common';

// ********************************************************************************
// == Notebook ==================================================================
// -- CUD -------------------------------------------------------------------------
export const Notebook_Create_Schema = NotebookCreate_Rest_Schema;
export type Notebook_Create = NotebookCreate_Rest;

export const Notebook_Delete_Schema = NotebookDelete_Rest_Schema;
export type Notebook_Delete = NotebookDelete_Rest;

export const Notebook_Publish_Schema = NotebookPublish_Rest_Schema;
export type Notebook_Publish = NotebookPublish_Rest;

// == Search ======================================================================
// -- Notebook --------------------------------------------------------------------
export type NotebookSortField = keyof Pick<Notebook,
  | 'name'
  | 'createTimestamp'
  | 'createdBy'
>;

/** the resulting query is the 'AND' of each member but the 'OR' of any multi-valued
 *  filter */
export type NotebookFilter = SortableFilter<NotebookSortField> & Readonly<{
  // NOTE: this supports only *exact* *match*
  name?: string;

  // NOTE: only one of these should be specified since they cascade. If more than
  //       one is specified then they're applied in waterfall order
  /** only show Notebooks that are viewable by this User (which includes any that
   *  are editable or created by the User) */
  viewableBy?: UserIdentifier;
  /** only show Notebooks that are editable by this User (which includes any that
   *  where created by the User) */
  editableBy?: UserIdentifier;
  /** only show Notebooks that were created by this User */
  createdBy?: UserIdentifier;

  // .. Deleted ...................................................................
  /** also include (soft) deleted Notebooks (`false` by default) */
  deleted?: boolean;

  /** include _only_ (soft) deleted Notebooks (`false` by default). This implies
   *  {@link #deleted} is `true` (but specifically the value of {@link #deleted}
   *  is ignored if this is `true`). */
  onlyDeleted?: boolean;
}>;

// -- Published Notebook ----------------------------------------------------------
export type NotebookPublishedSortField = keyof Pick<NotebookPublished,
  | 'title'
  | 'createTimestamp'
  | 'createdBy'
>;

/** the resulting query is the 'AND' of each member but the 'OR' of any multi-valued
 *  filter */
export type NotebookPublishedFilter = SortableFilter<NotebookPublishedSortField> & Readonly<{
  // NOTE: this supports only *exact* *match*
  title?: string;

  /** only show entries that were created by this User */
  createdBy?: UserIdentifier;
}>;

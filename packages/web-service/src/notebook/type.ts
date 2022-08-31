import { Notebook, NotebookCreate_Rest, NotebookCreate_Rest_Schema, NotebookDelete_Rest, NotebookDelete_Rest_Schema, NotebookHashtag_Rest, NotebookHashtag_Rest_Schema, NotebookPublished, NotebookPublish_Rest, NotebookPublish_Rest_Schema, UserIdentifier } from '@ureeka-notebook/service-common';

import { SortableFilter } from '../util/firestore';

// ** Service-Common **************************************************************
export {
  // SEE: @ureeka-notebook/service-common: notebook/util.ts
  getNotebookShareRoles,

  // SEE: @ureeka-notebook/service-common: notebook/type.ts
  Notebook,
  NotebookIdentifier,
  NotebookPublished,
  NotebookPublishedContent,
  NotebookPublishedTuple,
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

// ................................................................................
export const Notebook_Hashtag_Schema = NotebookHashtag_Rest_Schema;
export type Notebook_Hashtag = NotebookHashtag_Rest;

export const Notebook_Publish_Schema = NotebookPublish_Rest_Schema;
export type Notebook_Publish = NotebookPublish_Rest;

// == Search ======================================================================
// -- Notebook --------------------------------------------------------------------
// NOTE: when adding new sort fields don't forget to also update isNotebookSortField.
export type NotebookSortField = keyof Pick<Notebook,
  | 'name'
  | 'createTimestamp'
  | 'createdBy'
  // TODO: need to think through how to best do 'updateTimestamp' since the updates
  //       are really in the Versions, not the Notebook itself. And don't want to
  //       constantly update the Notebook just for the sake of updating the timestamp.
>;
// CHECK: Is there a better way to do this?
export const isNotebookSortField = (value: any): value is NotebookSortField =>
     value === 'name'
  || value === 'createTimestamp'
  || value === 'createdBy';

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

  /** only show Notebooks that have *any* of the specified hashtags. At most
   *  {@link MAX_ARRAY_CONTAINS_ANY} hashtags can be specified. (Any additional are
   *  ignored.) */
  // NOTE: this *cannot* be used with the 'viewableBy' or 'editableBy' filters
  hashtags?: string[];

  /** only show Notebooks that have / have not been published. If not specified then
   *  all Notebooks are shown */
  published?: boolean;

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

  /** only show Published Notebooks that were created by this User */
  createdBy?: UserIdentifier;

  /** only show Published Notebooks that have *any* of the specified hashtags. At
   *  most {@link MAX_ARRAY_CONTAINS_ANY} hashtags can be specified. (Any additional
   *  are ignored.) */
  hashtags?: string[];
}>;

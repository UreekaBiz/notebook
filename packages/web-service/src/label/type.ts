import { Label, LabelCreate_Rest, LabelCreate_Rest_Schema, LabelDelete_Rest, LabelDelete_Rest_Schema, LabelNotebookAdd_Rest, LabelNotebookAdd_Rest_Schema, LabelNotebookRemove_Rest, LabelNotebookRemove_Rest_Schema, LabelNotebookReorder_Rest, LabelNotebookReorder_Rest_Schema, LabelPublished_Storage, LabelUpdate_Rest, LabelUpdate_Rest_Schema, UserIdentifier } from '@ureeka-notebook/service-common';

import { SortableFilter } from '../util/firestore';

// ** Service-Common **************************************************************
export {
  // SEE: @ureeka-notebook/service-common: label/type.ts
  Label,
  LabelIdentifier,
  LabelPublished,
  LabelPublishedTuple,
  LabelSummary,
  LabelTuple,
  LabelVisibility,
  MAX_LABEL_SHARE_USERS,

  // SEE: @ureeka-notebook/service-common: label/search.ts
  LabelSearchResult,
  MAX_LABEL_SEARCH_RESULTS,
} from '@ureeka-notebook/service-common';

// ********************************************************************************
// == Label =======================================================================
// -- CUD -------------------------------------------------------------------------
export const Label_Create_Schema = LabelCreate_Rest_Schema;
export type Label_Create = LabelCreate_Rest;

export const Label_Update_Schema = LabelUpdate_Rest_Schema;
export type Label_Update = LabelUpdate_Rest;

export const Label_Delete_Schema = LabelDelete_Rest_Schema;
export type Label_Delete = LabelDelete_Rest;

// .. Notebook ....................................................................
export const LabelNotebook_Add_Schema = LabelNotebookAdd_Rest_Schema;
export type LabelNotebook_Add = LabelNotebookAdd_Rest;

export const LabelNotebook_Remove_Schema = LabelNotebookRemove_Rest_Schema;
export type LabelNotebook_Remove = LabelNotebookRemove_Rest;

export const LabelNotebook_Reorder_Schema = LabelNotebookReorder_Rest_Schema;
export type LabelNotebook_Reorder = LabelNotebookReorder_Rest;

// == Label Published =============================================================
// when a Label's visibility is set to 'public' then it is Published. When a Label's
// visibility is set to 'private' then it is Unpublished (Label Published is deleted).

// == Search ======================================================================
// -- Label -----------------------------------------------------------------------
export type LabelSortField = keyof Pick<Label,
  | 'name'
  | 'createTimestamp'
  | 'createdBy'
>;

/** the resulting query is the 'AND' of each member but the 'OR' of any multi-valued
 *  filter */
export type LabelFilter = SortableFilter<LabelSortField> & Readonly<{
  // NOTE: this supports only *exact* *match*
  name?: string;

  // NOTE: only one of these should be specified since they cascade. If more than
  //       one is specified then they're applied in waterfall order
  /** only show Labels that are viewable by this User (which includes any that
   *  are editable or created by the User) */
  viewableBy?: UserIdentifier;
  /** only show Labels that are editable by this User (which includes any that
   *  where created by the User) */
  editableBy?: UserIdentifier;
  /** only show Labels that were created by this User */
  createdBy?: UserIdentifier;
}>;

// -- Label Published ----------------------------------------------------------
export type LabelPublishedSortField = keyof Pick<LabelPublished_Storage,
  | 'name'
  | 'createTimestamp'
  | 'createdBy'
>;

/** the resulting query is the 'AND' of each member but the 'OR' of any multi-valued
 *  filter */
export type LabelPublishedFilter = SortableFilter<LabelPublishedSortField> & Readonly<{
  // NOTE: this supports only *exact* *match*
  name?: string;

  /** only show entries that were created by this User */
  createdBy?: UserIdentifier;
}>;

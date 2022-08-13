import { NotebookIdentifier } from '../notebook/type';
import { FieldValue, FirestoreArray } from '../util/firestore';
import { Modify } from '../util/type';
import { Label, LabelPublished, LabelSummary } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// -- Label -----------------------------------------------------------------------
export const LABELS = 'labels'/*top-level collection*/;
export const LABEL = `${LABELS}/{labelId}` as const/*document (used by CF triggers)*/;

// -- Label Published -------------------------------------------------------------
// NOTE: terrible English but consistent!
export const LABEL_PUBLISHEDS = 'label-publisheds';/*top-level collection*/
export const LABEL_PUBLISHED = `${LABEL_PUBLISHEDS}/{labelId}` as const/*document (used by CF triggers)*/;

// == RTDB ========================================================================
// -- Label Summary ---------------------------------------------------------------
// the key is the Label Identifier
export const LABEL_SUMMARIES = 'label-summaries'/*top-level 'collection'*/;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Label -----------------------------------------------------------------------
export type Label_Storage = Label/*nothing additional*/;

// -- Published Label -------------------------------------------------------------
export type LabelPublished_Storage = LabelPublished/*nothing additional*/;

// == RTDB ========================================================================
// -- Label Summary ---------------------------------------------------------------
export type LabelSummary_Storage = LabelSummary/*nothing additional*/;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- Label -----------------------------------------------------------------------
export type Label_Create = Modify<Label_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
export type Label_Update = Partial<Omit<Label_Storage, 'notebooks' | 'createTimestamp'| 'createdBy' | 'updateTimestamp'>>
  & Modify<Pick<Label_Storage, 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
      updateTimestamp: FieldValue/*always-write server-set*/;
    }>>;
// NOTE: hard-delete so no delete Action Type

// .. Notebook ....................................................................
export type LabelNotebook_Update = Modify<Pick<Label_Storage, 'notebooks'>, Readonly<{
      notebooks: (NotebookIdentifier[] | FirestoreArray/*array union / delete*/)/*always-write server-set*/;
    }>>
  & Modify<Pick<Label_Storage, 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
      updateTimestamp: FieldValue/*always-write server-set*/;
    }>>;
// NOTE: hard-delete so no delete Action Type

// -- Label Published -------------------------------------------------------------
// always written as if new (i.e. always completely overwritten)
export type LabelPublished_Write = Modify<LabelPublished_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
// NOTE: hard-delete so no delete Action Type

// == RTDB ========================================================================
// -- Label Summary ---------------------------------------------------------------
export type LabelSummary_Create = LabelSummary_Storage/*nothing additional*/;
export type LabelSummary_Update = Modify<LabelSummary_Storage, Readonly<{
  notebook: Object/*sentinel value for atomic Increment / Decrement*/;
}>>;

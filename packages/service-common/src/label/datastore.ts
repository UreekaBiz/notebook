import { NotebookIdentifier } from '../notebook/type';
import { FieldValue, FirestoreArray } from '../util/firestore';
import { Modify } from '../util/type';
import { Label, LabelPublished } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// -- Label -----------------------------------------------------------------------
export const LABELS = 'labels'/*top-level collection*/;
export const LABEL = `${LABELS}/{labelId}` as const/*document (used by CF triggers)*/;

// -- Label Published -------------------------------------------------------------
// NOTE: terrible English but consistent!
export const LABEL_PUBLISHEDS = 'label-publisheds';/*top-level collection*/
export const LABEL_PUBLISHED = `${LABEL_PUBLISHEDS}/{labelId}` as const/*document (used by CF triggers)*/;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Label -----------------------------------------------------------------------
export type Label_Storage = Label/*nothing additional*/;

// -- Published Label -------------------------------------------------------------
export type LabelPublished_Storage = LabelPublished/*nothing additional*/;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- Label -----------------------------------------------------------------------
export type Label_Create = Modify<Label_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
export type Label_Update = Partial<Omit<Label_Storage, 'notebookIds' | 'createTimestamp'| 'createdBy' | 'updateTimestamp'>>
  & Modify<Pick<Label_Storage, 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
      updateTimestamp: FieldValue/*always-write server-set*/;
    }>>;
// NOTE: hard-delete so no delete Action Type

// .. Notebook ....................................................................
export type LabelNotebook_Update = Modify<Pick<Label_Storage, 'notebookIds'>, Readonly<{
      notebookIds: (NotebookIdentifier[] | FirestoreArray/*array union / delete*/)/*always-write server-set*/;
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

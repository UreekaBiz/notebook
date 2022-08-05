import { FieldValue, FirestoreTimestamp } from '../util/firestore';
import { Modify } from '../util/type';
import { Label, LabelNotebook, LabelPublished, LabelSummary } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// -- Label -----------------------------------------------------------------------
export const LABELS = 'labels'/*top-level collection*/;
export const LABEL = `${LABELS}/{labelId}` as const/*document (used by CF triggers)*/;

// .. Label Notebook ..............................................................
export const LABEL_NOTEBOOKS = 'label-notebooks'/*sub-collection*/;
export const LABEL_NOTEBOOK = `${LABEL}/${LABEL_NOTEBOOKS}/{notebookId}` as const/*document (used by CF triggers)*/;

// -- Label Published -------------------------------------------------------------
// NOTE: terrible English but consistent!
export const LABEL_PUBLISHEDS = 'label-publisheds';/*top-level collection*/
export const LABEL_PUBLISHED = `${LABEL_PUBLISHEDS}/{labelId}` as const/*document (used by CF triggers)*/;

// .. Label Notebook Published ....................................................
export const LABEL_NOTEBOOK_PUBLISHEDS = 'label-notebook-publisheds'/*sub-collection*/;
export const LABEL_NOTEBOOK_PUBLISHED = `${LABEL_PUBLISHED}/${LABEL_NOTEBOOK_PUBLISHEDS}/{notebookId}` as const/*document (used by CF triggers)*/;

// == RTDB ========================================================================
// -- Label Summary ---------------------------------------------------------------
// the key is the Label Identifier
export const LABEL_SUMMARIES = 'label-summaries'/*top-level 'collection'*/;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Label -----------------------------------------------------------------------
export type Label_Storage = Label/*nothing additional*/;
export type LabelNotebook_Storage = LabelNotebook/*nothing additional*/;

// -- Published Label -------------------------------------------------------------
export type LabelPublished_Storage = LabelPublished/*nothing additional*/;
// SEE: LabelNotebook_Storage

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
export type Label_Update = Partial<Omit<Label, 'createTimestamp'| 'createdBy' | 'updateTimestamp'>>
  & Modify<Pick<Label_Storage, 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
      updateTimestamp: FieldValue/*always-write server-set*/;
    }>>;
// NOTE: hard-delete so no delete Action Type

// .. Label Notebook ..............................................................
// always written as if new (i.e. always completely overwritten)
export type LabelNotebook_Write = Modify<LabelNotebook_Storage, Readonly<{
  order: FirestoreTimestamp/*either an explicit Timestamp or server-set*/;

  createTimestamp: FieldValue/*always-write server-set*/;
}>>;
// NOTE: hard-delete so no delete Action Type

// -- Label Published -------------------------------------------------------------
// always written as if new (i.e. always completely overwritten)
export type LabelPublished_Write = Modify<LabelPublished_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
// NOTE: hard-delete so no delete Action Type

// .. Label Notebook Published ....................................................
// SEE: LabelNotebook_Write
// NOTE: hard-delete so no delete Action Type

// == RTDB ========================================================================
// -- Label Summary ---------------------------------------------------------------
export type LabelSummary_Update = LabelSummary_Storage/*nothing additional*/;

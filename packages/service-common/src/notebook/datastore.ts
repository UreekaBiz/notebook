import { FieldValue } from '../util/firestore';
import { Modify } from '../util/type';
import { Notebook, NotebookIdentifier, PublishedNotebook } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
export const NOTEBOOKS = 'notebooks'/*top-level collection*/;
export const NOTEBOOK = `${NOTEBOOKS}/{notebookId}` as const/*document (used by CF triggers)*/;

// NOTE: Each Notebook will have at most one Published Notebook at any point. Its a
//       top-level collection since it needs to be accessed with some query to all
//       Published Notebooks.
export const NOTEBOOK_PUBLISHED_NOTEBOOKS = 'notebook-published-notebooks'; /*top-level collection*/
export const NOTEBOOK_PUBLISHED_NOTEBOOK = `${NOTEBOOK_PUBLISHED_NOTEBOOKS}/{notebookId}` as const/*document (used by CF triggers)*/;

// -- Trigger Context -------------------------------------------------------------
export type PublishedNotebookParams = Readonly<{
  notebookId/*NOTE: must match #NOTEBOOK*/: NotebookIdentifier;
}>;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- Notebook --------------------------------------------------------------------
export type Notebook_Storage = Notebook/*nothing additional*/;

// -- Published Notebook ----------------------------------------------------------
export type PublishedNotebook_Storage = PublishedNotebook/*nothing additional*/;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Notebook --------------------------------------------------------------------
export type Notebook_Create = Readonly<Modify<Notebook_Storage, {
  createTimestamp: FieldValue/*server written*/;
  updateTimestamp: FieldValue/*server written*/;
}>>;
export type Notebook_Update = Readonly<Modify<Pick<Notebook_Storage, 'updateTimestamp' | 'lastUpdatedBy'>, {
  updateTimestamp: FieldValue/*server written*/;
}>> & Partial<Omit<Notebook, 'deleted' | 'createTimestamp'| 'createdBy' | 'updateTimestamp'>>;
export type Notebook_Delete = Readonly<Modify<Pick<Notebook_Storage, 'deleted' | 'updateTimestamp' | 'lastUpdatedBy'>, {
  updateTimestamp: FieldValue/*server written*/;
}>>;

// -- Published Notebook ----------------------------------------------------------
export type PublishedNotebook_Create = Readonly<Modify<PublishedNotebook_Storage, {
  createTimestamp: FieldValue/*server written*/;
  updateTimestamp: FieldValue/*server written*/;
}>>;

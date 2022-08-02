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
export type Notebook_Create = Modify<Notebook_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;
export type Notebook_Update = Modify<Pick<Notebook_Storage, 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>> & Partial<Omit<Notebook, 'deleted' | 'createTimestamp'| 'createdBy' | 'updateTimestamp'>>;
export type Notebook_Delete = Modify<Pick<Notebook_Storage, 'deleted' | 'updateTimestamp' | 'lastUpdatedBy'>, Readonly<{
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;

// -- Published Notebook ----------------------------------------------------------
export type PublishedNotebook_Create = Modify<PublishedNotebook_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;

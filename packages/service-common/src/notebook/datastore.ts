import { FieldValue } from '../util/firestore';
import { Modify } from '../util/type';
import { Notebook, NotebookIdentifier, NotebookLabelUser, PublishedNotebook } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
// -- Notebook --------------------------------------------------------------------
export const NOTEBOOKS = 'notebooks'/*top-level collection*/;
export const NOTEBOOK = `${NOTEBOOKS}/{notebookId}` as const/*document (used by CF triggers)*/;

// .. Version .....................................................................
// SEE: /notebookEditor/datastore.ts

// .. Checkpoint ..................................................................
// SEE: /notebookEditor/datastore.ts

// .. Label User Share ............................................................
export const LABEL_NOTEBOOK_USERS = 'notebook-label-users'/*sub-collection*/;
export const LABEL_NOTEBOOK_USER = `${NOTEBOOK}/${LABEL_NOTEBOOK_USERS}/{userId}` as const/*document (used by CF triggers)*/;

// -- Published Notebook ----------------------------------------------------------
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

// .. Version .....................................................................
// SEE: /notebookEditor/datastore.ts

// .. Checkpoint ..................................................................
// SEE: /notebookEditor/datastore.ts

// .. Label User Share ............................................................
export type NotebookLabelUser_Storage = NotebookLabelUser/*nothing additional*/;

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

// .. Version .....................................................................
// SEE: /notebookEditor/datastore.ts

// .. Checkpoint ..................................................................
// SEE: /notebookEditor/datastore.ts

// .. Label User Share ............................................................
// always written as if new (i.e. always completely overwritten)
export type NotebookLabelUser_Write = Modify<NotebookLabelUser_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
}>>;
// NOTE: hard-delete so no delete Action Type

// -- Published Notebook ----------------------------------------------------------
export type PublishedNotebook_Create = Modify<PublishedNotebook_Storage, Readonly<{
  createTimestamp: FieldValue/*always-write server-set*/;
  updateTimestamp: FieldValue/*always-write server-set*/;
}>>;

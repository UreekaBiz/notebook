import { NOTEBOOK } from '../notebook/datastore';
import { NotebookIdentifier } from '../notebook/type';
import { FieldValue, FirestoreTimestamp } from '../util/firestore';
import { Modify } from '../util/type';
import { Checkpoint, CheckpointIdentifier, NotebookVersion, NotebookVersionIdentifier } from './type';

// ** Constants *******************************************************************
// == Firestore ===================================================================
export const NOTEBOOK_VERSIONS = 'notebook-versions'/*sub-collection*/;
export const NOTEBOOK_VERSION = `${NOTEBOOK}/${NOTEBOOK_VERSIONS}/{versionId}` as const/*document (used by CF triggers)*/;

// NOTE: this is fully qualified (with 'Notebook') simply for consistency with
//       respect to the name of the Firestore collection
export const NOTEBOOK_CHECKPOINTS = 'notebook-checkpoints'/*sub-collection*/;
export const NOTEBOOK_CHECKPOINT = `${NOTEBOOK}/${NOTEBOOK_CHECKPOINTS}/{versionId}` as const/*document (used by CF triggers)*/;

// -- Trigger Context -------------------------------------------------------------
export type NotebookVersionParams = Readonly<{
  notebookId/*NOTE: must match #NOTEBOOK*/: NotebookIdentifier;
  versionId/*NOTE: must match #NOTEBOOK_VERSION*/: NotebookVersionIdentifier;
}>;

export type CheckpointParams = Readonly<{
  notebookId/*NOTE: must match #NOTEBOOK*/: NotebookIdentifier;
  versionId/*NOTE: must match #NOTEBOOK_CHECKPOINT*/: CheckpointIdentifier;
}>;

// ** Storage Types ***************************************************************
// == Firestore ===================================================================
// -- Version ------------------------------------------------------------------------
export type NotebookVersion_Storage = NotebookVersion/*nothing additional*/;

// -- Checkpoint -----------------------------------------------------------------
export type Checkpoint_Storage = Checkpoint/*nothing additional*/;

// ** Action Types ****************************************************************
// == Firestore ===================================================================
// -- Version ------------------------------------------------------------------------
export type NotebookVersion_Write = Readonly<Modify<NotebookVersion_Storage, {
  createTimestamp: FieldValue/*server written*/;
}>>;

// -- Checkpoint -----------------------------------------------------------------
export type Checkpoint_Write = Readonly<Modify<Checkpoint_Storage, {
  createTimestamp: FirestoreTimestamp/*server written*/;
}>>;

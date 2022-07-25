import { CollectionReference } from 'firebase-admin/firestore';

import { nameof, Checkpoint, CheckpointIdentifier, Checkpoint_Storage, NotebookIdentifier, NotebookVersion, NotebookVersionIdentifier, NotebookVersion_Storage, NOTEBOOK_CHECKPOINTS, NOTEBOOK_VERSIONS } from '@ureeka-notebook/service-common';

import { notebookDocument } from '../notebook/datastore';

// ********************************************************************************
// .. Storage Types ...............................................................
// SEE: @ureeka-notebook/service-common: notebookEditor/datastore.ts

// == Collection ==================================================================
// -- Version ---------------------------------------------------------------------
export const versionCollection = (notebookId: NotebookIdentifier) =>
  notebookDocument(notebookId).collection(NOTEBOOK_VERSIONS) as CollectionReference<NotebookVersion_Storage>;
export const versionDocument = (notebookId: NotebookIdentifier, versionId: NotebookVersionIdentifier) =>
  versionCollection(notebookId).doc(versionId);

// -- Checkpoint ------------------------------------------------------------------
export const checkpointCollection = (notebookId: NotebookIdentifier) =>
  notebookDocument(notebookId).collection(NOTEBOOK_CHECKPOINTS) as CollectionReference<Checkpoint_Storage>;
export const checkpointDocument = (notebookId: NotebookIdentifier, versionId: CheckpointIdentifier) =>
  checkpointCollection(notebookId).doc(versionId);

// === Query ======================================================================
// -- Version ---------------------------------------------------------------------
export const versionRangeQuery = (notebookId: NotebookIdentifier, minIndex/*exclusive*/: number, maxIndex/*inclusive*/: number) =>
  versionCollection(notebookId)
    .where(nameof<NotebookVersion>('index'), '>'/*exclusive*/, minIndex)
    .where(nameof<NotebookVersion>('index'), '<='/*inclusive*/, maxIndex)
    .orderBy(nameof<NotebookVersion>('index'), 'asc')/*ordered by contract*/;

// ................................................................................
export const lastVersionsQuery = (notebookId: NotebookIdentifier, minIndex/*exclusive*/: number) =>
  versionCollection(notebookId)
    .where(nameof<NotebookVersion>('index'), '>'/*exclusive*/, minIndex)
    .orderBy(nameof<NotebookVersion>('index'), 'asc')/*ordered by contract*/;

export const lastVersionQuery = (notebookId: NotebookIdentifier) =>
  versionCollection(notebookId)
    .orderBy(nameof<NotebookVersion>('index'), 'desc')
    .limit(1/*last document*/);

// -- Checkpoint ------------------------------------------------------------------
export const lastCheckpointQuery = (notebookId: NotebookIdentifier) =>
  checkpointCollection(notebookId)
    .orderBy(nameof<Checkpoint>('index'), 'desc')
    .limit(1/*last document*/);

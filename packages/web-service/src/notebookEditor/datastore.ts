import { collection, doc, limit, orderBy, query, where, CollectionReference } from 'firebase/firestore';

import { nameof, Checkpoint, CheckpointIdentifier, NotebookIdentifier, NotebookVersion, NotebookVersion_Storage, NotebookVersionIdentifier, NOTEBOOK_CHECKPOINTS, NOTEBOOK_VERSIONS } from '@ureeka-notebook/service-common';

import { notebookDocument } from '../notebook/datastore';

// ********************************************************************************
// == Collection ==================================================================
// .. Version .....................................................................
export const notebookVersionCollection = (notebookId: NotebookIdentifier) => collection(notebookDocument(notebookId), NOTEBOOK_VERSIONS) as CollectionReference<NotebookVersion_Storage>;
export const notebookVersionDocument = (notebookId: NotebookIdentifier, versionId: NotebookVersionIdentifier) => doc(notebookVersionCollection(notebookId), versionId);

// -- Checkpoint ------------------------------------------------------------------
export const CheckpointCollection = (notebookId: NotebookIdentifier) => collection(notebookDocument(notebookId), NOTEBOOK_CHECKPOINTS) as CollectionReference<Checkpoint>;
export const CheckpointDocument = (notebookId: NotebookIdentifier, checkpointId: CheckpointIdentifier) => doc(CheckpointCollection(notebookId), checkpointId);

// == Query =======================================================================
// -- Version ---------------------------------------------------------------------
export const lastVersionQuery = (notebookId: NotebookIdentifier) =>
  query(notebookVersionCollection(notebookId),
    orderBy(nameof<NotebookVersion>('index'), 'desc'),
    limit(1/*last document*/)
  );

// ................................................................................
export const fillGapQuery = (notebookId: NotebookIdentifier, currentIndex: number) =>
  query(notebookVersionCollection(notebookId),
    where(nameof<NotebookVersion>('index'), '>'/*exclusive*/, currentIndex),
    orderBy(nameof<NotebookVersion>('index'), 'asc')
  );

// -- Checkpoint ------------------------------------------------------------------
export const lastCheckpointQuery = (checkpointId: CheckpointIdentifier) =>
  query(CheckpointCollection(checkpointId),
    orderBy(nameof<Checkpoint>('index'), 'desc'),
    limit(1/*last document*/)
  );

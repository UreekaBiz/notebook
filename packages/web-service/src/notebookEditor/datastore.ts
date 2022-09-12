import { ref } from 'firebase/database';
import { collection, doc, limit, orderBy, query, where, CollectionReference } from 'firebase/firestore';

import { nameof, notebookKey, notebookUserSessionKey, Checkpoint, CheckpointIdentifier, NotebookIdentifier, NotebookVersion, NotebookVersion_Storage, NotebookVersionIdentifier, SessionIdentifier, UserIdentifier, NOTEBOOK_CHECKPOINTS, NOTEBOOK_VERSIONS } from '@ureeka-notebook/service-common';

import { notebookDocument } from '../notebook/datastore';
import { database } from '../util/firebase';

// ** Firestore *******************************************************************
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

export const lastVersionsQuery = (notebookId: NotebookIdentifier, minIndex/*exclusive*/: number) =>
  query(notebookVersionCollection(notebookId),
    where(nameof<NotebookVersion>('index'), '>'/*exclusive*/, minIndex),
    orderBy(nameof<NotebookVersion>('index'), 'asc')
  );

// -- Checkpoint ------------------------------------------------------------------
export const lastCheckpointQuery = (checkpointId: CheckpointIdentifier) =>
  query(CheckpointCollection(checkpointId),
    orderBy(nameof<Checkpoint>('index'), 'desc'),
    limit(1/*last document*/)
  );

// ** RTDB ************************************************************************
// == Notebook User-Session =======================================================
export const notebookUsersRef = (notebookId: NotebookIdentifier) => ref(database, notebookKey(notebookId));
export const notebookUserSessionsRef = (notebookId: NotebookIdentifier, userId: UserIdentifier, sessionId: SessionIdentifier) => ref(database, notebookUserSessionKey(notebookId, userId, sessionId));

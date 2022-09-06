import { getDocs, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Step as ProseMirrorStep } from 'prosemirror-transform';

import { generateNotebookVersionIdentifier, ClientIdentifier, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion, NotebookVersion_Write, UserIdentifier } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { firestore } from '../util/firebase';
import { notebookVersionDocument, lastVersionQuery, lastVersionsQuery } from './datastore';

const log = getLogger(ServiceLogger.NOTEBOOK_EDITOR);

// ********************************************************************************
// == Read ========================================================================
// Subscribes to new NotebookVersions
export const onNewVersion = (notebookId: NotebookIdentifier, callback: (version: NotebookVersion) => void) => {
  return onSnapshot(lastVersionQuery(notebookId), async snapshot => {
    // NOTE: for new Notebooks (which have no NotebookVersions), the snapshot is always empty
    if(snapshot.empty) { log.debug(`Empty snapshot while reading new Version for Notebook (${notebookId}).`); return/*nothing to do*/; }
    if(snapshot.size !== 1) log.warn(`Unexpected number of Versions (${snapshot.size} !== 1) while reading new Version for Notebook (${notebookId}).`);

    const metadata = snapshot.metadata,
          version = snapshot.docs[0 /*only one*/].data();
    if(metadata.hasPendingWrites || (version.createTimestamp === null/*server-set timestamp hasn't been returned yet*/)) { log.info('Ignoring pending write.'); return/*don't use Version since waiting for server-sent value*/; }

    callback(version);
  });
};

// --------------------------------------------------------------------------------
// get NotebookVersions between the specified index and whatever the latest is
export const getVersionsFromIndex = async (notebookId: NotebookIdentifier, index/*exclusive*/: number): Promise<NotebookVersion[]> => {
  const snapshot = await getDocs(lastVersionsQuery(notebookId, index));
  return snapshot.docs.map(doc => doc.data());
};

// == Write =======================================================================
// writes the batch of ProseMirror Steps as NotebookVersions
// SEE: @cloud-functions: notebookEditor/version.ts
export const writeVersions = async (userId: UserIdentifier, clientId: ClientIdentifier, schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier, startingIndex: number, pmSteps: ProseMirrorStep[]): Promise<boolean> => {
// log.debug(`Start step transaction for startingIndex (${startingIndex})`);
  return runTransaction(firestore, async transaction => {
    // NOTE: only checks against first Version since if that doesn't exist then no
    //       other Version can exist by definition (since monotonically increasing)
    // NOTE: if other Versions *do* get written as this writes then the Transaction
    //       will be aborted internally by Firestore (by definition). When re-run
    //       then the Version would exist and this returns false.
    const firstVersionId = generateNotebookVersionIdentifier(startingIndex),
          firstVersionRef = notebookVersionDocument(notebookId, firstVersionId);
    const snapshot = await transaction.get(firstVersionRef);
// log.debug(`Trying to write Notebook Versions ${startingIndex} - ${startingIndex + pmSteps.length - 1}`);
    if(snapshot.exists()) return false/*abort -- NotebookVersion with startingIndex already exists*/;

    pmSteps.forEach((pmStep, index) => {
      const versionIndex = startingIndex + index;
      const versionId = generateNotebookVersionIdentifier(versionIndex),
            versionDocumentRef = notebookVersionDocument(notebookId, versionId);

      const version: NotebookVersion_Write = {
        schemaVersion,

        index: versionIndex,
        clientId,
        content: JSON.stringify(pmStep.toJSON())/*FIXME: refactor into a function*/,

        createdBy: userId,
        createTimestamp: serverTimestamp()/*server-set timestamp*/,
      };
      transaction.set(versionDocumentRef, version);
    });

    return true/*successfully written*/;
  });
};

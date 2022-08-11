import { Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { Step as ProseMirrorStep } from 'prosemirror-transform';

import { generateNotebookVersionIdentifier, ClientIdentifier, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion_Storage, NotebookVersion_Write, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { getSnapshot, ServerTimestamp } from '../util/firestore';
import { lastVersionQuery, lastVersionsQuery, versionDocument } from './datastore';

// ********************************************************************************
// == Get =========================================================================
// -- Latest ----------------------------------------------------------------------
// returns the last known Version using the specified Transaction
export const getLastVersion = async (transaction: Transaction | undefined/*outside transaction*/, notebookId: NotebookIdentifier): Promise<NotebookVersion_Storage | undefined/*no Versions*/> => {
  const snapshot = await getSnapshot(transaction, lastVersionQuery(notebookId));
  if(snapshot.empty) return undefined/*by contract*/;

  if(snapshot.size > 1) logger.warn(`Expected a single last Version but received ${snapshot.size}. Ignoring all but first.`);
  return snapshot.docs[0/*only one by contract*/].data();
};

// --------------------------------------------------------------------------------
// get NotebookVersions between the specified index and whatever the latest is
export const getVersionsFromIndex = async (transaction: Transaction | undefined/*outside transaction*/, notebookId: NotebookIdentifier, index/*exclusive*/: number): Promise<NotebookVersion_Storage[]> => {
  const snapshot = await getSnapshot(transaction, lastVersionsQuery(notebookId, index));
  return snapshot.docs.map(doc => doc.data());
};

// == Write =======================================================================
// writes the batch of ProseMirror Steps as Notebook Versions
// SEE: @web-service: notebookEditor/version.ts
export const writeVersions = async (
  transaction: Transaction | undefined/*outside transaction*/,
  userId: UserIdentifier, clientId: ClientIdentifier,
  schemaVersion: NotebookSchemaVersion,  notebookId: NotebookIdentifier,
  startingIndex: number, pmSteps: ProseMirrorStep[]
): Promise<void> => {
  const transactionBody = async (transaction: Transaction) => {
    // NOTE: only checks against first Version since if that doesn't exist then no
    //       other Version can exist by definition (since monotonically increasing)
    // NOTE: if other Versions *do* get written as this writes then the Transaction
    //       will be aborted internally by Firestore (by definition). When re-run
    //       then the Version would exist and this returns false.
    const firstVersionId = generateNotebookVersionIdentifier(startingIndex),
          firstVersionRef = versionDocument(notebookId, firstVersionId);
    const snapshot = await transaction.get(firstVersionRef);
// logger.debug(`Trying to write Notebook Versions ${startingIndex} - ${startingIndex + versions.length - 1}`);
    if(snapshot.exists) throw new ApplicationError('functions/already-exists', `Step with index ${startingIndex} already exists.`)/*abort -- NotebookVersion with startingIndex already exists*/;

    pmSteps.forEach((pmStep, index) => {
      const versionIndex = startingIndex + index;
      const versionId = generateNotebookVersionIdentifier(versionIndex),
            versionDocumentRef = versionDocument(notebookId, versionId);

      const version: NotebookVersion_Write = {
        schemaVersion,

        index: versionIndex,
        clientId,
        content: JSON.stringify(pmStep.toJSON())/*FIXME: refactor into a function*/,

        createdBy: userId,
        createTimestamp: ServerTimestamp/*by contract*/,
      };
      transaction.create(versionDocumentRef, version);
    });
  };

  // if a Transaction is provided then use it, otherwise create a new one
  if(transaction) await transactionBody(transaction);
  else await firestore.runTransaction(transactionBody);
};

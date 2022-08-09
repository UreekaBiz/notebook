import { EditorState } from 'prosemirror-state';

import { generateNotebookVersionIdentifier, ApplicationError, ClientIdentifier, Command, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion_Write, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ServerTimestamp } from '../util/firestore';
import { versionDocument } from './datastore';

// ********************************************************************************
// performs the given command in a EditorStateTransaction from the EditorState and
// tries to save the resulting steps on the Version collection. This function
// performs a transaction that tries to save the steps in order, if any of the
// steps fail to save, the transaction will fail and none of the steps will be saved.
export const saveEditorStateTransaction = async (
notebookId: NotebookIdentifier, schemaVersion: NotebookSchemaVersion, userId: UserIdentifier,
clientId: ClientIdentifier, initialVersionIndex: number, editorState: EditorState, command: Command
): Promise<void> => {
  return firestore.runTransaction(async transaction => {
    // NOTE: only checks against first Version since if that doesn't exist then no
    //       other Version can exist by definition (since monotonically increasing)
    // NOTE: if other Versions *do* get written as this writes then the Transaction
    //       will be aborted internally by Firestore (by definition). When re-run
    //       then the Version would exist and this returns false.
    const firstVersionId = generateNotebookVersionIdentifier(initialVersionIndex),
          firstVersionRef = versionDocument(notebookId, firstVersionId);
    const snapshot = await transaction.get(firstVersionRef);
    // log.debug(`Trying to write Notebook Versions ${startingIndex} - ${startingIndex + versions.length - 1}`);
    if(snapshot.exists) throw new ApplicationError('functions/already-exists', `Step with index ${initialVersionIndex} already exists.`); /*abort -- NotebookVersion with startingIndex already exists*/;

    // starts a new EditorStateTransaction
    const tr = editorState.tr;
    // TODO: handle errors while applying the command
    // applies the command to the transaction
    command(tr);

    tr.steps.forEach((pmStep, index) => {
      const versionIndex = initialVersionIndex + index;
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
  });
};

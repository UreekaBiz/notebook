import { EditorState } from 'prosemirror-state';

import { generateNotebookVersionIdentifier, ClientIdentifier, Command, NotebookIdentifier, NotebookSchemaVersion, NotebookVersion_Write, UserIdentifier } from '@ureeka-notebook/service-common';

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
    // starts a new transaction
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

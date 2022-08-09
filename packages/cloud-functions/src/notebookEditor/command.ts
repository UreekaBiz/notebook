import { EditorState } from 'prosemirror-state';

import { getEditorState, getRandomSystemUserId, sleep,  ClientIdentifier, Command, NotebookIdentifier, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { notebookDocument } from '../notebook/datastore';
import { ApplicationError } from '../util/error';
import { getSnapshot } from '../util/firestore';
import { getNotebookContent } from './checkpoint';
import { getLastVersion, writeVersions } from './version';

// ********************************************************************************
// == Type ========================================================================
type CollaborationDelay = Readonly<{
  /** time in millis to delay before reading. No delay if <= 0 */
  readDelayMs: number;
  /** time in millis to delay before writing. No delay if <= 0 */
  writeDelayMs: number;
}>;
const collaborationDelay: CollaborationDelay = { readDelayMs: 2000, writeDelayMs: 2000 };

// function that creates a command that interacts with the given state.
// NOTE: the returned command can be executed multiple times in an attempt to save
//       the steps. Any heavy computation should be done on the CommandGenerator
//       i.e. doing an async operation.
type CommandGenerator = (props: {
  userId: UserIdentifier;
  notebookId: NotebookIdentifier;
  clientId: ClientIdentifier;
  versionIndex: number;
  editorState: EditorState;
}) => Promise<Command>;

// == Utility =====================================================================
export const wrapCommandFunction = async (userId: UserIdentifier, notebookId: NotebookIdentifier, label: string, func: CommandGenerator ): Promise<NotebookIdentifier> => {
  try {
    // ensure that the Notebook document still exists (i.e. has not been deleted
    // either hard or soft) and that the caller has the right permissions to edit
    // its content.
    const notebookRef = notebookDocument(notebookId), notebookSnapshot = await getSnapshot(undefined/*no transaction*/, notebookRef);
    if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot perform command ${label} for non-existing Notebook (${notebookId}) for User (${userId}).`);
    const notebook = notebookSnapshot.data()!;
    if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot perform command ${label} for soft-deleted Notebook (${notebookId}) for User (${userId}).`);
    if(!notebook.editors.includes(userId) && notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Only Editors of a Notebook (${notebookId}) may perform command ${label} for User (${userId}).`);

    // gets the last version of the Notebook and gets the reference for the next
    // logical version. If no version exists then the next version is the first
    const lastVersion = await getLastVersion(undefined/*no transaction*/, notebookId),
          lastVersionIndex = lastVersion?.index;
    const nextVersionIndex = lastVersionIndex ? lastVersionIndex + 1 : NO_NOTEBOOK_VERSION/*start of document if no last version*/;

    // gets the content at the given version if it exists.
    if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
    const notebookContent = lastVersionIndex ? await getNotebookContent(undefined/*no transaction*/, notebook.schemaVersion, notebookId, lastVersionIndex) : undefined/*no content*/;
    const editorState = getEditorState(notebook.schemaVersion, notebookContent);
    if(!editorState) throw new ApplicationError('data/integrity', `Cannot create editorState for Notebook (${notebookId}) for version (${lastVersion}).`);

    // Creates a unique identifier for the clientId.
    // FIXME: Consistency
    const clientId = getRandomSystemUserId();

    const command = await func({ clientId, editorState, notebookId, userId, versionIndex: nextVersionIndex });
    // create a new transaction
    const tr = editorState.tr;
    // execute the command in the transaction
    command(tr);

    if(collaborationDelay.writeDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
    // TODO: Implement system to get new steps and sync in case of failure.
    // write the versions from the steps generated on the command
    await writeVersions(
      notebookId,
      notebook.schemaVersion/*matching Notebook for consistency*/,
      userId,
      clientId,
      nextVersionIndex,
      tr.steps
    );
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error performing command ${label} for notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }

  return notebookId;
};

// == Command =====================================================================
// inserts multiple numbers at random positions in the Notebook.
export const insertNumbers = (): CommandGenerator => async () => {
  return (tr) => {
    // inserts 10 characters at random positions in the document.
    for(let i=0;i<10;i++) {
      const position = Math.floor(Math.random() * tr.doc.content.size) + 1/*start of valid content*/;
      tr.insertText(String(i), position, position);
    }
    return true/*command can be performed*/;
  };
};

// inserts the specified text at the start of the the specified notebook.
export const insertText = (text: string): CommandGenerator =>  async () => {
  return (tr) => {
    tr.insertText(text, 1, 1/*start of document*/);
    return true/*command can be performed*/;
  };
};

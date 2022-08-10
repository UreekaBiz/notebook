import { EditorState } from 'prosemirror-state';

import { createEditorState, getEditorStateFromDocAndVersions, getRandomSystemUserId, sleep, ClientIdentifier, Command, NotebookIdentifier, ShareRole, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { getNotebook } from '../notebook/notebook';
import { getEnv } from '../util/environment';
import { ApplicationError } from '../util/error';
import { getDocumentAtVersion } from './document';
import { getLastVersion, getVersionsFromIndex, writeVersions } from './version';

// ********************************************************************************
const MAX_ATTEMPTS = Math.max(0, Number(getEnv('NOTEBOOK_VERSION_MAX_ATTEMPTS', '5'/*guess*/)));

// == Type ========================================================================
type CollaborationDelay = Readonly<{
  /** time in millis to delay before reading. No delay if <= 0 */
  readDelayMs: number;
  /** time in millis to delay before writing. No delay if <= 0 */
  writeDelayMs: number;
}>;
const collaborationDelay: CollaborationDelay = { readDelayMs: 2000, writeDelayMs: 2000 };

// --------------------------------------------------------------------------------
// function that creates a Command that interacts with the given Editor State
// NOTE: the returned Command can be executed multiple times in an attempt to save
//       the Steps. Any heavy computation should be done on the CommandGenerator
//       (e.g doing an async operation)
type CommandGenerator = (props: {
  userId: UserIdentifier;
  clientId: ClientIdentifier;

  notebookId: NotebookIdentifier;
  versionIndex: number;

  editorState: EditorState;
}) => Promise<Command>;

// == Utility =====================================================================
export const wrapCommandFunction = async (userId: UserIdentifier, notebookId: NotebookIdentifier, label: string, func: CommandGenerator): Promise<NotebookIdentifier> => {
  try {
    const notebook = await getNotebook(undefined/*no transaction*/, userId, notebookId, ShareRole.Editor, `perform command ${label}`);
    const schemaVersion = notebook.schemaVersion/*for convenience*/;

    // gets the last Version of the Notebook and gets the reference for the next
    // logical Version. If no Version exists then the next Version is the first
    let currentVersion = await getLastVersion(undefined/*no transaction*/, notebookId),
        currentVersionIndex = currentVersion ? currentVersion.index : NO_NOTEBOOK_VERSION;

    // gets the content at the given Version if it exists
    if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
    const notebookContent = currentVersionIndex ? await getDocumentAtVersion(undefined/*no transaction*/, schemaVersion, notebookId, currentVersionIndex) : undefined/*no content*/;
    let editorState = createEditorState(schemaVersion, notebookContent);

    // try to write the Steps
    let written = false/*not written by default*/;
    for(let i=0; i<MAX_ATTEMPTS; i++) {
      let { doc } = editorState;

      // get the missing Versions from the last recorded Version
      const versions = await getVersionsFromIndex(undefined/*no transaction*/, notebookId, currentVersionIndex);
      currentVersionIndex = (versions.length < 1) ? currentVersionIndex : versions[versions.length - 1].index;
      const nextVersionIndex = currentVersionIndex + 1;

      // collapse the Steps into the Document to create a new Editor State
      editorState = getEditorStateFromDocAndVersions(schemaVersion, doc, versions);

      // creates a unique identifier for the clientId
      const clientId = getRandomSystemUserId()/*FIXME: consistency*/;

      // create the Command and create a new Transaction and execute the Command within it
      const command = await func({ userId, clientId, notebookId, versionIndex: nextVersionIndex, editorState });
      const tr = editorState.tr;
      command(tr);

      try {
        if(collaborationDelay.writeDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
        // write the Versions from the Steps generated on the Command
        await writeVersions(
          userId, clientId,
          schemaVersion, notebookId,
          nextVersionIndex, tr.steps
        );
        written = true;
        break/*success - stop trying*/;
      } catch(error) {
        if(error instanceof ApplicationError) continue/*handled error, try to write again*/;
        throw error;
      }
    }
    if(!written) throw new ApplicationError('functions/aborted', `Could not perform Command '${label}' for Notebook (${notebookId}) for User (${userId}) due to too many attempts.`);
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error performing Command '${label}' for Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }
  return notebookId;
};

// == Command =====================================================================
// inserts multiple numbers at random positions in the Notebook
export const insertNumbers = (): CommandGenerator => async () => {
  return (tr) => {
    // inserts 10 (arbitrary) characters at random positions in the document
    for(let i=0; i<10; i++) {
      const position = Math.floor(Math.random() * tr.doc.content.size) + 1/*start of valid content*/;
      tr.insertText(String(i), position, position);
    }
    return true/*command can be performed*/;
  };
};

// inserts the specified text at the start of the the specified Notebook
export const insertText = (text: string): CommandGenerator =>  async () => {
  return (tr) => {
    tr.insertText(text, 1, 1/*start of document*/);
    return true/*Command can be performed*/;
  };
};

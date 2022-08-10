import { EditorState } from 'prosemirror-state';

import { createEditorState, generateClientIdentifier, generateUuid, getEditorStateFromDocAndVersions, sleep, Command, NotebookIdentifier, ShareRole, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

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
export type EditorStateCommand = Readonly<{
  /** context for logging */
  name: string;

  /** generates the {@link Command} based on the given {@link EditorState} */
  command: (editorState: EditorState) => Command;
}>;

// function that potentially does work and creates a Command that interacts with
// the given Editor State
// NOTE: the returned Command can be executed multiple times in an attempt to save
//       the Steps. Any heavy computation should be done on the CommandGenerator
//       (e.g doing an async operation)
export type CommandGenerator = (props: {
  userId: UserIdentifier;

  /** the {@link Notebook} being executed against (for context) */
  notebookId: NotebookIdentifier;
}) => Promise<EditorStateCommand>;

// == Utility =====================================================================
export const executeAsyncCommand = async (userId: UserIdentifier, notebookId: NotebookIdentifier, asyncCommand: CommandGenerator) => {
  const label = asyncCommand.name/*for context*/;

  // the client identifier is based on the calling User
  // TODO: think about if it should be based on the System User
  const clientId = generateClientIdentifier({ userId, sessionId: generateUuid()/*unique for this 'session'*/ });

  try {
    const notebook = await getNotebook(undefined/*no transaction*/, userId, notebookId, ShareRole.Editor, `perform Command '${label}'`);
    // CHECK: is the right answer to always use NotebookSchemaVersionLatest?
    const schemaVersion = notebook.schemaVersion/*for convenience*/;

    const editorStateCommand = await asyncCommand({ userId, notebookId });

    // gets the last Version of the Notebook
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

      // create the Command and create a new Transaction and execute the Command within it
      const command = editorStateCommand.command(editorState);
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
    if(!written) throw new ApplicationError('functions/aborted', `Could not write ProseMirror Steps for Command '${label}' for Notebook (${notebookId}) for User (${userId}) due to too many attempts.`);
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error performing Command '${label}' for Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }
};

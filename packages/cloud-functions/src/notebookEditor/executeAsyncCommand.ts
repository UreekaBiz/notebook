import { EditorState } from 'prosemirror-state';

import { createEditorState, generateClientIdentifier, generateUuid, getEditorStateFromDocAndVersions, sleep, Command, NotebookIdentifier, ShareRole, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { getNotebook } from '../notebook/notebook';
import { getEnv } from '../util/environment';
import { ApplicationError } from '../util/error';
import { getLatestDocument } from './document';
import { getVersionsFromIndex, writeVersions } from './version';

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
    // before running the async function, check that the Notebook exists and that
    // the caller has permission to edit it
    await getNotebook(undefined/*no transaction*/, userId, notebookId, ShareRole.Editor, `perform Command '${label}'`);

    // run the async function
    const editorStateCommand = await asyncCommand({ userId, notebookId });

    // since the above async may have taken a long time, this ensures that the
    // Notebook *still* exists and the caller still has permissions to edit it
    const notebook = await getNotebook(undefined/*no transaction*/, userId, notebookId, ShareRole.Editor, 'execute D3AN');
    // CHECK: is the right answer to always use NotebookSchemaVersionLatest?
    const schemaVersion = notebook.schemaVersion/*matching that of the Notebook for any edits*/;

    // gets the latest Version of the Notebook
    if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.readDelayMs);
    const { latestIndex, document } = await getLatestDocument(undefined/*no transaction*/, userId, schemaVersion, notebookId)/*throws on error*/;
    let currentVersionIndex = latestIndex;
    let editorState = createEditorState(schemaVersion, document);

    // execute the Command and write the resulting ProseMirror Steps
    let written = false/*not written by default*/;
    for(let i=0; i<MAX_ATTEMPTS; i++) {
      // execute the Command given the current Editor State
      const command = editorStateCommand.command(editorState);
      const tr = editorState.tr;
      command(tr);

      try {
        // write the Versions from the Steps generated on the Command
        if(collaborationDelay.writeDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
        await writeVersions( /*FIXME: move back to returning a boolean if this fails and save the exceptions for exceptions*/
          userId, clientId,
          schemaVersion, notebookId,
          currentVersionIndex + 1/*next Version*/, tr.steps
        );
        written = true;
        break/*success - stop trying*/;
      } catch(error) {
        if(!(error instanceof ApplicationError)) throw error;
      }

      // failed writing above (implying that there were later Versions yet to be read)
      // so get the missing Versions from the last recorded Version and update the
      // Editor State
      if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.readDelayMs);
      const versions = await getVersionsFromIndex(undefined/*no transaction*/, notebookId, currentVersionIndex);
      // FIXME: add check if there were no additional Versions (which means that
      //        the above write *didn't* fail due to later Versions)
      currentVersionIndex = (versions.length < 1) ? currentVersionIndex : versions[versions.length - 1].index;
      editorState = getEditorStateFromDocAndVersions(schemaVersion, editorState.doc, versions);
    }
    if(!written) throw new ApplicationError('functions/aborted', `Could not write ProseMirror Steps for Command '${label}' for Notebook (${notebookId}) for User (${userId}) due to too many attempts.`);
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error performing Command '${label}' for Notebook (${notebookId}) for User (${userId}). Reason: `, error);
  }
};

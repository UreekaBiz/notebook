import { EditorState } from 'prosemirror-state';

import { contentToStep, getSchema, getEditorState, getRandomSystemUserId, sleep,  ClientIdentifier, Command, NotebookIdentifier, UserIdentifier, NO_NOTEBOOK_VERSION, nodeToContent } from '@ureeka-notebook/service-common';

import { notebookDocument } from '../notebook/datastore';
import { getEnv } from '../util/environment';
import { ApplicationError } from '../util/error';
import { getSnapshot } from '../util/firestore';
import { getNotebookContent } from './checkpoint';
import { lastVersionsQuery } from './datastore';
import { getLastVersion, writeVersions } from './version';

const MAX_ATTEMPTS = Math.max(0, Number(getEnv('NOTEBOOK_VERSION_MAX_ATTEMPTS', '5'/*guess*/)));

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
    let currentVersion = await getLastVersion(undefined/*no transaction*/, notebookId),
        currentVersionIndex = currentVersion?.index;

    // gets the content at the given version if it exists.
    if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
    const notebookContent = currentVersionIndex ? await getNotebookContent(undefined/*no transaction*/, notebook.schemaVersion, notebookId, currentVersionIndex) : undefined/*no content*/;
    let editorState = getEditorState(notebook.schemaVersion, notebookContent);
    if(!editorState) throw new ApplicationError('data/integrity', `Cannot create editorState for Notebook (${notebookId}) for version (${currentVersion}).`);

    // Creates a unique identifier for the clientId.
    // FIXME: Consistency
    const clientId = getRandomSystemUserId();

    let written = false/*not written by default*/;
    // try to write the steps
    for(let i=0;i<MAX_ATTEMPTS;i++) {
      // get the missing versions from the last recorded version.
      const versionSnapshot = await getSnapshot(undefined/*no transaction*/, lastVersionsQuery(notebookId, currentVersionIndex ?? NO_NOTEBOOK_VERSION - 1/*all existing versions*/));
      const versions = versionSnapshot.docs.map(doc => doc.data());
      // update current version to the most up to date version.
      currentVersion = versions.reduce((acc, version) => {
        if(!acc || acc.index < version.index) return version;
        return acc;
      }, currentVersion);
      currentVersionIndex = currentVersion?.index;
      const nextVersionIndex = currentVersionIndex ? currentVersionIndex + 1 : NO_NOTEBOOK_VERSION/*start of document if no last version*/;

      const schema = getSchema(notebook.schemaVersion);
      let { doc } = editorState;
      // collapse the steps into the document to create a new editorState.
      versions.forEach(version => {
        const prosemirrorStep = contentToStep(schema, version.content);

        // ProseMirror takes a ProsemirrorStep and applies it to the Document as the
        // last Step generating a new Document
        // NOTE: this process can result in failure for multiple reasons such as the
        //       Schema is invalid or the Step tried collide with another Step and the
        //       result is invalid.
        // NOTE: if the process fails then that failed Step can be safely ignored since
        //       the ClientDocument will ignore it as well
        const stepResult = prosemirrorStep.apply(doc);
        if(stepResult.failed || !stepResult.doc) { console.error(`Invalid Notebook (${notebook.schemaVersion}) Version (${version.index}) '${version.content}' while performing command ${label}. Reason: ${stepResult.failed}. Ignoring.`); return/*ignore Version / Step*/; }
        doc = stepResult.doc;
      });
      // create an editorState from the newly created document
      editorState = getEditorState(notebook.schemaVersion, nodeToContent(doc));
      if(!editorState) throw new ApplicationError('data/integrity', `Cannot create editorState for Notebook (${notebookId}) for version (${currentVersion}).`);

      const command = await func({ clientId, editorState, notebookId, userId, versionIndex: nextVersionIndex });
      // create a new transaction
      const tr = editorState.tr;
      // execute the command in the transaction
      command(tr);

      try {
        if(collaborationDelay.writeDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
        // write the versions from the steps generated on the command
        await writeVersions(
          notebookId,
          notebook.schemaVersion/*matching Notebook for consistency*/,
          userId,
          clientId,
          nextVersionIndex,
          tr.steps
        );
        written = true;
        break/*success - stop trying*/;
      } catch(error){
        if(error instanceof ApplicationError) continue/*handled error, try to write again*/;
        throw error;
      }
    }
    if(!written) throw new ApplicationError('functions/aborted', `Could not perform command ${label} for notebook (${notebookId}) for User (${userId}) due to too many attempts.`);
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

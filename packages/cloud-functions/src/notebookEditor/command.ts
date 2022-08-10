import { EditorState } from 'prosemirror-state';
import { logger } from 'firebase-functions';

import { contentToStep, getSchema, getEditorState, getRandomSystemUserId, sleep,  ClientIdentifier, Command, NotebookIdentifier, UserIdentifier, NO_NOTEBOOK_VERSION, nodeToContent } from '@ureeka-notebook/service-common';

import { notebookDocument } from '../notebook/datastore';
import { getEnv } from '../util/environment';
import { ApplicationError } from '../util/error';
import { getSnapshot } from '../util/firestore';
import { getNotebookContent } from './checkpoint';
import { lastVersionsQuery } from './datastore';
import { getLastVersion, writeVersions } from './version';

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
    // ensure that the Notebook document still exists (i.e. has not been deleted
    // either hard or soft) and that the caller has the right permissions to edit
    // its content
    const notebookRef = notebookDocument(notebookId), notebookSnapshot = await getSnapshot(undefined/*no transaction*/, notebookRef);
    if(!notebookSnapshot.exists) throw new ApplicationError('functions/not-found', `Cannot perform command ${label} for non-existing Notebook (${notebookId}) for User (${userId}).`);
    const notebook = notebookSnapshot.data()!;
    if(notebook.deleted) throw new ApplicationError('data/deleted', `Cannot perform command ${label} for soft-deleted Notebook (${notebookId}) for User (${userId}).`);
    if(!notebook.editors.includes(userId) && notebook.createdBy !== userId) throw new ApplicationError('functions/permission-denied', `Only Editors of a Notebook (${notebookId}) may perform Command '${label}' for User (${userId}).`);
    const schemaVersion = notebook.schemaVersion/*for convenience*/,
          schema = getSchema(schemaVersion);

    // gets the last Version of the Notebook and gets the reference for the next
    // logical Version. If no Version exists then the next Version is the first
    let currentVersion = await getLastVersion(undefined/*no transaction*/, notebookId),
        currentVersionIndex = currentVersion?.index;

    // gets the content at the given Version if it exists
    if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
    const notebookContent = currentVersionIndex ? await getNotebookContent(undefined/*no transaction*/, schemaVersion, notebookId, currentVersionIndex) : undefined/*no content*/;
    let editorState = getEditorState(schemaVersion, notebookContent);
    if(!editorState) throw new ApplicationError('data/integrity', `Cannot create Editor State for Notebook (${notebookId}) for Version (${currentVersion}).`);

    // creates a unique identifier for the clientId
    const clientId = getRandomSystemUserId()/*FIXME: consistency*/;

    // try to write the Steps
    let written = false/*not written by default*/;
    for(let i=0; i<MAX_ATTEMPTS; i++) {
      // get the missing Versions from the last recorded Version
      const versionSnapshot = await getSnapshot(undefined/*no transaction*/, lastVersionsQuery(notebookId, currentVersionIndex ?? NO_NOTEBOOK_VERSION - 1/*all existing versions*/));
      const versions = versionSnapshot.docs.map(doc => doc.data());
      // update current Version to the most up to date Version
      // FIXME: what is this doing? Versions are pulled in order by contract.
      //        If all of this is simply to get the last Version then just get it!!!
      currentVersion = versions.reduce((acc, version) => {
        if(!acc || acc.index < version.index) return version;
        return acc;
      }, currentVersion);
      currentVersionIndex = currentVersion?.index;
      const nextVersionIndex = currentVersionIndex ? currentVersionIndex + 1 : NO_NOTEBOOK_VERSION/*start of document if no last Version*/;

      let { doc } = editorState;
      // collapse the Steps into the Document to create a new Editor State
      // FIXME: this is effectively collapseVersions() (which just needs to be
      //        refactored to handle this case as well)
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
        if(stepResult.failed || !stepResult.doc) { logger.error(`Invalid Notebook (${schemaVersion}) Version (${version.index}) '${version.content}' while performing Command '${label}'. Ignoring. Reason: ${stepResult.failed}`); return/*ignore Version / Step*/; }
        doc = stepResult.doc;
      });
      // create an Editor State from the newly created Document
      editorState = getEditorState(schemaVersion, nodeToContent(doc));
      if(!editorState) throw new ApplicationError('data/integrity', `Cannot create Editor State for Notebook (${notebookId}) for Version (${currentVersion}).`);

      // create the Command and create a new Transaction and execute the Command within it
      const command = await func({ userId, clientId, notebookId, versionIndex: nextVersionIndex, editorState });
      const tr = editorState.tr;
      command(tr);

      try {
        if(collaborationDelay.writeDelayMs > 0) await sleep(collaborationDelay.writeDelayMs);
        // write the Versions from the Steps generated on the Command
        await writeVersions(
          userId, clientId,
          schemaVersion/*matching Notebook for consistency*/, notebookId,
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

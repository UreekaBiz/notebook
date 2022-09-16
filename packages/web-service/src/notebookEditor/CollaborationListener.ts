import { Editor } from '@tiptap/core';
import { onDisconnect, serverTimestamp, set } from 'firebase/database';
import * as collab from 'prosemirror-collab';
import { NodeSelection, TextSelection } from 'prosemirror-state';
import { Step as ProseMirrorStep } from 'prosemirror-transform';

import { distinctUntilChanged, BehaviorSubject } from 'rxjs';

import { contentToJSONStep, generateClientIdentifier, getNodeName, isNodeSelection, sleep, AuthedUser, NotebookIdentifier, NotebookVersion, NotebookSchemaVersion, NotebookUserSession_Write, Unsubscribe, UserIdentifier, NO_NOTEBOOK_VERSION } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging/type';
import { getEnvNumber } from '../util/environment';
import { ApplicationError } from '../util/error';
import { notebookUserSessionsRef } from './datastore';
import { getLatestDocument } from './document';
import { notebookUsers$ } from './observable';
import { getVersionsFromIndex, onNewVersion, writeVersions } from './version';

const log = getLogger(ServiceLogger.NOTEBOOK_EDITOR);

// ********************************************************************************
const versionBatchSize = Math.max(1/*at least one*/, getEnvNumber('NEXT_PUBLIC_NOTEBOOK_VERSION_BATCH_SIZE', 1/*default to 1*/));

// --------------------------------------------------------------------------------
// TODO: make this configurable at runtime to facilitate debugging
type CollaborationDelay = Readonly<{
  /** time in millis to delay before reading. No delay if <= 0 */
  readDelayMs: number;
  /** time in millis to delay before writing. No delay if <= 0 */
  writeDelayMs: number;
}>;
const collaborationDelay: CollaborationDelay = { readDelayMs: 0, writeDelayMs: 0 };

// ================================================================================
// handles the collaboration of the associated Editor with Firestore. The basic
// outline is as follows:
//
// - Firestore: watch for latest Version to change
//   - reads
//   - commits changes to Editor
//   - updates last-written Version if read Version past what Editor had
//
// - ProseMirror: on 'update'
//   - gets pending changes from Editor
//     - writes in batches to Firestore
//       - if fail (meaning other client already wrote Version), flag to wait for read
//       - if succeed
//         - update last-written Version
//         - check if Editor changed and stop writing batches if so
// Notice that changes are *not* committed on write! Changes are only committed on
// read to ensure that all changes (regardless if local or remote) are handled the
// same way and incorporated into the Editor.
//
// Complexities come from the following:
// - The User may cause the handler / listener to be 'canceled' at any time
//   - Handled by checking if initialized after each 'await'
// - Firestore may have multiple callbacks at the same time
//   - Handled via 'isReadingVersions' latch
// - Reader and Writer are async (meaning that one can be in both the read and write
//   handlers at the *same time* due to the 'await's)
//   - Handled by checking the Editor's index before and after to see if changed
// - Changes are only 'committed' on read ('collab.sendableSteps()' will keep
//   returning the same pending changes until 'committed')
//   - Handled via 'lastWriteIndex' which is used to advance through the pending changes

// handles collaboration via Firestore for the Editor. This class is designed to be
// one-shot per User-Editor-Notebook and not be reused.
// ********************************************************************************
export class CollaborationListener {
  private readonly user: AuthedUser;
  // NOTE: *must* be unique per User-Session pair. Specifically, if just the userId
  //       is passed then ProseMirror gets confused if the same User is editing in
  //       different sessions
  // NOTE: the naming comes from ProseMirror
  private readonly clientId: UserIdentifier;

  private editor: Editor;
  private readonly notebookId: NotebookIdentifier;
  private readonly schemaVersion: NotebookSchemaVersion;

  private initialized: boolean = false/*by default*/;

  //...............................................................................
  private lastReadIndex = NO_NOTEBOOK_VERSION/*default - set on #loadInitialContent()*/;
  private lastWriteIndex = NO_NOTEBOOK_VERSION/*default - set on #loadInitialContent()*/;

  //...............................................................................
  // if initialContentLoaded is false then the Editor is disabled and there won't
  // be any step generated. Set to true after #loadInitialContent
  private initialContentLoaded: boolean = false/*by contract*/;

  // latches to ensure that only a single callback executes at a time
  private isReadingVersions: boolean = false/*by contract*/;
  private isWritingPendingSteps: boolean = false/*by contract*/;

  // if a Version is known to exist in Firestore but hasn't been read yet then
  // this flag is set to true to wait for that Version to be read. (This is set
  // while trying to write NotebookVersions to Firestore.)
  private isWaitingForNewVersions: boolean = false/*by contract*/;

  // Observable that emits when a change has been made to the Editor but that change
  // has not yet been written to Firestore
  private readonly pendingWrites$ = new BehaviorSubject<boolean>(false/*initially nothing pending*/);

  // ..............................................................................
  private readonly editorUnsubscribes: Unsubscribe[] = []/*initially empty until #listenEditor()*/;
  private readonly firestoreUnsubscribes: Unsubscribe[] = []/*initially empty until #listenFirestore()*/;

  // ==============================================================================
  public constructor(user: AuthedUser, editor: Editor, schemaVersion: NotebookSchemaVersion, notebookId: NotebookIdentifier) {
    this.user = user;
    this.clientId = generateClientIdentifier(user);

    this.editor = editor;
    this.schemaVersion = schemaVersion;
    this.notebookId = notebookId;
  }

  // == Lifecycle =================================================================
  /**
   * Listens to the associated {@link Notebook}. This should be called once and
   * only once until {@link #shutdown()} is called (an error is thrown if already
   * initialized).
   *
   * @see #shutdown()
   */
  public async initialize() {
    if(this.initialized) throw new ApplicationError('functions/internal', `Notebook listener already initialized. (One-shot only.)`);
    this.initialized = true/*by contract*/;

    // load initial content
    await this.loadInitialContent();
    if(!this.initialized) { log.info(`NotebookListener was shutdown before it finished initialization ${this.logContext()}.`); return/*listener was terminated before finished initialization*/; }

    // listen to changes and send them to Firestore
    await this.listenEditor();
    // listen to Versions from Firestore and apply them to the Editor and to User
    // cursor updates from the RTDB
    await this.listenFirebase();

    log.debug(`Version Listener initialized with write batch-size of ${versionBatchSize} ${this.logContext()}.`);
  }

  /**
   * Cancels the listeners associated with the Editor. Shutting down an already
   * shut-down (or never {@link #initialize()}d) listener has no effect. This will
   * free up resources associated with the listeners and is required.
   *
   * @see #initialize()
   */
  public async shutdown() {
    if(!this.initialized) throw new ApplicationError('functions/internal', `Notebook listener already shut down (or never initialized) ${this.logContext()}.`);

    await this.unsubscribeEditor();
    await this.unsubscribeFirebase();

    this.lastReadIndex = NO_NOTEBOOK_VERSION/*reset*/;
    this.lastWriteIndex = NO_NOTEBOOK_VERSION/*reset*/;

    this.isReadingVersions = false/*by contract*/;
    this.isWritingPendingSteps = false/*by contract*/;
    this.initialContentLoaded = false/*by contract*/;
    this.isWaitingForNewVersions = false/*by contract*/;

    // NOTE: explicitly *not* setting `initialized = false` because this is one-shot
  }

  // == Internal Listeners ========================================================
  // .. Editor ....................................................................
  private async listenEditor() {
    if(!this.initialContentLoaded) { log.warn(`Listening to Editor before initial content is loaded ${this.logContext()}.`); return/*prevent invalid actions*/; }

    const editor = this.editor/*local closure so doesn't change on remove*/;

    const updateCallback = this.writePendingSteps.bind(this);
    editor.on('update', updateCallback);
    this.editorUnsubscribes.push(() => editor.off('update', updateCallback));

    const selectionUpdateCallback = this.handleSelectionUpdate.bind(this);
    editor.on('selectionUpdate', selectionUpdateCallback);
    this.editorUnsubscribes.push(() => editor.off('selectionUpdate', selectionUpdateCallback));
  }

  private async unsubscribeEditor() {
    this.editorUnsubscribes.forEach(unsubscribe => unsubscribe());
    this.editorUnsubscribes.splice(0/*clear by contract*/);
  }

  // .. Firebase ..................................................................
  private async listenFirebase() {
    if(!this.initialContentLoaded) { log.warn(`Listening to Firestore before initial content is loaded ${this.logContext()}.`); return/*prevent invalid actions*/; }

    // Firestore
    const unsubscribe = onNewVersion(this.notebookId, this.handleNewVersion.bind(this));
    this.firestoreUnsubscribes.push(unsubscribe);

    // RTDB -- setup onDisconnect handler
    // SEE: SessionService for another example
    // REF: https://firebase.google.com/docs/database/web/offline-capabilities#how-ondisconnect-works
    try {
      const ref = notebookUserSessionsRef(this.notebookId, this.user.userId, this.user.sessionId);
      await onDisconnect(ref).remove()/*remove the structure when the User disconnects*/;
    } catch(error) {
      log.error(`Error while establishing on-disconnect handler for Notebook (${this.notebookId}) for User-Session (${this.user.userId}-${this.user.sessionId}). Reason: `, error);
    }
  }

  private async unsubscribeFirebase() {
    // Firestore -- unsubscribe from all listeners
    this.firestoreUnsubscribes.forEach(unsubscribe => unsubscribe());
    this.firestoreUnsubscribes.splice(0/*clear by contract*/);

    // RTDB -- cancel onDisconnect handler
    try {
      const ref = notebookUserSessionsRef(this.notebookId, this.user.userId, this.user.sessionId);
      await onDisconnect(ref).cancel();
    } catch(error) {
      log.error(`Error while canceling session on-disconnect handler for Notebook (${this.notebookId}) for User-Session (${this.user.userId}-${this.user.sessionId}). Reason: `, error);
    }
  }

  // ==============================================================================
  // gets the latest Checkpoint (if one exists) and any remaining NotebookVersions
  // to get the last known Firestore state
  private async loadInitialContent() {
    if(this.initialContentLoaded) { log.warn(`Attempting to load initial content after being already loaded ${this.logContext()}.`); return/*nothing to do*/; }

    // get the latest content (from a combination of Checkpoint and NotebookVersions)
    const { latestIndex, document } = await getLatestDocument(this.clientId, this.schemaVersion, this.notebookId)/*throws on error*/;
    if(!this.initialized) return/*listener was terminated before finished initialization*/;
    log.debug(`Loaded initial content at Version ${latestIndex} ${this.logContext()}.`);
    this.lastReadIndex = latestIndex/*by definition*/;
    this.lastWriteIndex = latestIndex/*start at the latest index*/;

    // set the initial Editor content from what was just read
    // REF: https://github.com/ueberdosis/tiptap/issues/491
    const { doc, tr } = this.editor.view.state;
    const tipTapDocument = this.editor.schema.nodeFromJSON(document.toJSON())/*NOTE: seems to be required by TipTap given different Schemas?*/;
    const selection = TextSelection.create(doc, 0, doc.content.size);
    const transaction = tr
            .setSelection(selection)
            .replaceSelectionWith(tipTapDocument, false/*don't inherit marks*/)
            .setMeta('preventUpdate', true)
            .setMeta('addToHistory', false/*do not include initial step fetch into the history*/);
    this.editor.view.dispatch(transaction);

    // register the Collaboration Plugin with the Editor at the latest index
    this.editor.registerPlugin(collab.collab({ clientID: this.clientId, version: latestIndex }));

    this.initialContentLoaded = true/*by contract -- done*/;

    // write a (temporary) stub to the RTDB to indicate that the User is connected
    await this.writeUserSession(0/*FIXME: currently anything*/);
  }

  // == Observable ================================================================
  public onPendingWrites$() {
    // absorbs any duplicate states since the listener doesn't care if nothing changed
    return this.pendingWrites$
                .pipe(distinctUntilChanged());
  }

  // ------------------------------------------------------------------------------
  public onUsers$() { return notebookUsers$(this.notebookId); }

  // == Editor ====================================================================
  public getEditorIndex() {
    return collab.getVersion(this.editor.view.state);
  }

  // ------------------------------------------------------------------------------
  private async handleSelectionUpdate() {
    const selection = this.editor.view.state.selection;
    if(!selection) return/*nothing to do*/;

    return this.writeUserSession(selection.$anchor.pos);
  }

  // == Read ======================================================================
  // callback from Firestore when a new latest Version (specified) becomes available.
  // This gets all latest Versions (including any new ones that may have appeared)
  // and 'commits' them to the Editor
  private async handleNewVersion() {
    if(!this.initialized) throw new ApplicationError('functions/internal', `Trying to get Notebook Versions before initialization ${this.logContext()}.`);
    if(!this.initialContentLoaded) throw new ApplicationError('functions/internal', `Trying to get Notebook Versions before initial content is loaded  ${this.logContext()}.`);

    if(collaborationDelay.readDelayMs > 0) await sleep(collaborationDelay.readDelayMs)/*before latch-check for sanity*/;
    if(this.isReadingVersions) return/*prevent multiple handlers if Firestore gets multiple updates*/;

    // get all stored Versions after the current Editor index
    // NOTE: the Editor index (which is equal to the last-read index) must be used
    //       since it is the last 'committed' Version. This ensures that any pending
    //       changes are rebased into the newly to-be read Versions
    // NOTE: for a plethora of reasons (the easiest being the artificial delay added
    //       above), the actual Version that triggered this callback is not actually
    //       relevant. Because of this, there may be 'pending' Firestore callbacks
    //       that result in no Versions being read below since they were read in
    //       another callback
    const editorIndex = this.getEditorIndex();
    let versions: NotebookVersion[];
    this.isReadingVersions = true/*close latch*/;
    try {
      versions = await getVersionsFromIndex(this.notebookId, editorIndex);
      if(!this.initialized) return/*listener was terminated before finished async request*/;
      if(versions.length < 1) return/*nothing more to do (SEE: NOTE above)*/;
    } catch(error) {
      log.info(`Unexpected error reading new Versions ${this.logContext()}: `, error);
      throw error/*rethrow*/;
    } finally {
      this.isReadingVersions = false/*open latch*/;
    }

    // update the reader state based on what was just read
    const lastVersionIndex = versions[versions.length - 1].index/*since in order by contract, must be last*/;
    log.debug(`Read ${versions.length} Notebook Versions (${this.lastReadIndex} - ${lastVersionIndex}) (Editor at ${editorIndex} and last wrote ${this.lastWriteIndex}) ${this.logContext()}.`);
    this.lastReadIndex = lastVersionIndex;

    // update the Editor with the read Versions
    this.updateEditorWithVersions(versions);

    // if the Editor is now past the last written Version then advance the writer
    // index continue after the last read (since it must be the latest Version)
    if(this.getEditorIndex() > this.lastWriteIndex) {
      log.debug(`Editor is past last written Version after read (${this.getEditorIndex()} > ${this.lastWriteIndex}) ${this.logContext()}. Advancing last write.`);
      this.lastWriteIndex = this.getEditorIndex();
    } /* else -- Editor still has pending writes */

    // clear the latch set in #writePendingSteps()
    // NOTE: this must be done *after* updating the last write index above or risk
    //       attempting to overwrite just-read Versions
    this.isWaitingForNewVersions = false/*by definition*/;

    // write any pending changes since it may have aborted waiting for this read
    // (specifically isWaitingForNewVersions *was* true). Can't assume that there
    // will be additional User edits that will force the pending changes to write
    // CHECK: can pre-check isWaitingForNewVersions and only call if was set
    // NOTE: if above CHECK is followed this this would need to explicitly reset
    //       pendingWrites$ to 'false' by definition
    await this.writePendingSteps();
  }

  // ..............................................................................
  // 'commit' the specified Versions to the Editor
  private updateEditorWithVersions(versions: NotebookVersion[]) {
    // NOTE: seems to be required by TipTap given different Schemas?
    // SEE: @ureeka-notebook/service-common: /notebookEditor/version.ts
    const proseMirrorSteps = versions.map(({ content }) => ProseMirrorStep.fromJSON(this.editor.schema, contentToJSONStep(content)));

    // NOTE: 'clientId' is what ProseMirror calls them
    const clientIds = versions.map(({ clientId }) => clientId);

    const transaction = collab.receiveTransaction(this.editor.view.state, proseMirrorSteps, clientIds, { mapSelectionBackward: true });

    // update the NodeSelection only if the Node still exits
    // NOTE: updating the attributes of a Node causes it to be replaced and
    //       ProseMirror changes the Selection from being NodeSelection to
    //       TextSelection which causes the Selection to be lost. To fix that a new
    //       NodeSelection is created from the previous position mapped through the
    //       Transaction from `collab`.
    const currentSelection = this.editor.state.selection;
    if(isNodeSelection(currentSelection)) {
      // NOTE: creating a NodeSelection can throw an error if there is no Node to
      //       select. This can happen if the Node was removed.
      try {
        // update the Selection when the selected Node was replaced with same Node
        const nodeSelection = new NodeSelection(transaction.selection.$anchor);
        if(getNodeName(nodeSelection.node) === getNodeName(currentSelection.node)) {
          transaction.setSelection(nodeSelection);
        } /* else -- not the same Node */
      } catch(error) {
        log.debug('New selection is not a Node Selection anymore. Node was deleted. Ignoring.');
      }
    } /* else -- was not a NodeSelection */

    this.editor.view.dispatch(transaction);
  }

  // == Write =====================================================================
  // Editor 'update' callback that attempts to write a batch of pending changes
  // (ProseMirror Steps) from the Editor to Firestore. These changes *are not*
  // 'committed' to the Editor (that occurs when they're read back in #handleNewVersion())
  // NOTE: this is also called by #handleNewVersion() to ensure that if this had
  //       to exit early due to write-conflict then those updates will get written
  private async writePendingSteps() {
    if(!this.initialized) { log.warn(`Trying to write changes before initialization or after shutdown ${this.logContext()}.`); return/*prevent invalid actions*/; }
    if(!this.initialContentLoaded) throw new ApplicationError('functions/internal', `Trying to get write changes before initial content is loaded  ${this.logContext()}.`);

    if(this.isWritingPendingSteps) return/*prevent multiple handlers if ProseMirror gets multiple updates*/;
    if(this.isWaitingForNewVersions) return/*do nothing -- transactions will fail until the most recent data is acquired*/;

    this.isWritingPendingSteps = true/*close latch*/;
    try {
      // because this is within a latch and it's possible that additional edits
      // have occurred while writing, it simply loops until there are no more
      // sendable Steps
      // NOTE: there is a complication that since Steps are only 'committed' on read,
      //       this will continue to think that there are pending Steps. See the logic
      //       below ('startIndex') for how this is handled.
      let sendableStep;
      while(sendableStep = collab.sendableSteps(this.editor.view.state)) {
        if(sendableStep.steps.length < 1) { log.warn(`Expected ProseMirror Steps but found none ${this.logContext()}.`); return/*nothing to do*/; }

        // ensure that the Editor and the Sendable Steps are in sync
        // NOTE: for all intents and purposes they *must* be -- this is just for sanity
        // CHECK: is retrying a valid strategy when out of sync?
        const editorIndex = this.getEditorIndex();
        if(editorIndex !== sendableStep.version) { log.warn(`Editor Version and Sendable Steps do not match (${editorIndex} !== ${sendableStep.version}) ${this.logContext()}. Retrying.`); continue/*retry*/; }

        // attempt to write the ProseMirror Steps in batches to Firestore.
        // Since Steps are only 'committed' on read, the Editor may be at a
        // Version behind the last written index. Only those Steps that are
        // after the last written index are written.
        // TODO: always ensure that #getEditorIndex() and sendableStep.version match?
        let startIndex = this.lastWriteIndex - editorIndex;/*starting index for batch*/
        if(startIndex >= sendableStep.steps.length) return/*all Steps have been written -- waiting on read*/;
        this.pendingWrites$.next(true/*has pending writes*/)/*specifically here so as to not get spurious updates*/;
        log.debug(`Editor (at Version ${editorIndex}) has ${sendableStep.steps.length} Sendable Steps (at Version ${sendableStep.version}) and last written (${this.lastWriteIndex}) will write starting at ${startIndex} ${this.logContext()}.`);
        while(startIndex < sendableStep.steps.length) { /*loop until all Steps are written*/
          const pmSteps = sendableStep.steps.slice(startIndex, startIndex + versionBatchSize)/*take next batch of PM Steps*/;
          const result = await writeVersions(this.user.userId, this.clientId, this.schemaVersion, this.notebookId, this.lastWriteIndex + 1/*next Version*/, pmSteps);
          if(!this.initialized) return/*listener was terminated before finished transaction*/;
          if(!result) { /*PM Steps were not written*/
            // FIXME: it's possible that the write failed and that the reads that
            //        would have brought it back up to date already happened while
            //        the write-failure was being handled. Net-net: this can't just
            //        always set isWaitingForNewVersions = true. It needs to check!
            log.debug(`Failed to write Notebook Versions at index ${editorIndex + 1} ${this.logContext()}. Will wait for latest to be read and retry.`);
            this.isWaitingForNewVersions = true/*by definition*/;
            return/*stop writing changes to wait for new Versions to be read*/;
          } /* else -- PM Steps were written */
          log.debug(`Wrote Notebook Versions ${(pmSteps.length <= 1) ? `${this.lastWriteIndex + 1}` : `from ${this.lastWriteIndex + 1} to ${this.lastWriteIndex + pmSteps.length}`} ${this.logContext()}.`);

          this.lastWriteIndex += pmSteps.length/*increment by number of Steps written*/;
          startIndex += pmSteps.length/*increment by number of Steps written*/;

          // if the reader read while writing then it's possible that the Editor is
          // at a different Version. Leave this loop since there may be a different
          // set of Sendable Steps to write.
          if(editorIndex !== this.getEditorIndex()) { log.debug(`Reader read while writing Notebook Version (${editorIndex} !== ${this.getEditorIndex()}) ${this.logContext()}. Stopping batch write and will retry pending writes.`); break/*retry outer*/; }
        }
      }
    } catch(error) {
      // FIXME: what is the best way to handle errors in handlers from ProseMirror?
      log.error(`Error writing Versions ${this.logContext()}: `, error);
    } finally {
      this.isWritingPendingSteps = false/*open latch*/;

      // there are pending writes IFF there are Versions to be read
      this.pendingWrites$.next(this.isWaitingForNewVersions);
    }
  }

  // -- User-Session --------------------------------------------------------------
  private async writeUserSession(cursorPosition: number) {
    if(!this.initialized) { log.warn(`Trying to write Notebook User-Session before initialization or after shutdown ${this.logContext()}.`); return/*prevent invalid actions*/; }
    if(!this.initialContentLoaded) throw new ApplicationError('functions/internal', `Trying to write Notebook User-Session before initial content is loaded  ${this.logContext()}.`);
log.info(`Writing Notebook User-Session at position ${cursorPosition}.`);
    try {
      const ref = notebookUserSessionsRef(this.notebookId, this.user.userId, this.user.sessionId);
      const userSession: NotebookUserSession_Write = {
        cursorPosition,
        timestamp: serverTimestamp()/*write-always server-set*/,
      };
      await set(ref, userSession);
    } catch(error) {
      log.error(`Error writing Notebook User-Session ${this.logContext()}: `, error);
    }
  }

  // == Logging ===================================================================
  private logContext() { return `for Notebook (${this.notebookId})`; }
}

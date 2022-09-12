import { Editor } from '@tiptap/core';
import { Observable } from 'rxjs';

import { AuthedUser, NotebookIdentifier, NotebookSchemaVersion, NotebookUsers } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { ApplicationError } from '../util';
import { notebookEditorDemo2AsyncNodeExecute, notebookEditorDemoAsyncNodeExecute } from './function';
import { NotebookEditorDemo2AsyncNode_Execute, NotebookEditorDemoAsyncNode_Execute } from './type';
import { CollaborationListener } from './CollaborationListener';

const log = getLogger(ServiceLogger.NOTEBOOK_EDITOR);

// ********************************************************************************
export class NotebookEditorService {
  protected initialized: 'not-initialized' | 'initializing' | 'initialized' = 'not-initialized';

  //...............................................................................
  protected readonly collaborationListener: CollaborationListener;

  // == Lifecycle =================================================================
  /**
   * Creates an Editor service for the specific {@link NotebookSchemaVersion} and
   * {@link NotebookIdentifier}.
   *
   * @see #initialize()
   * @see #shutdown()
   */
  public constructor(private readonly user: AuthedUser, private editor: Editor, schemaVersion: NotebookSchemaVersion, private readonly notebookId: NotebookIdentifier) {
    this.collaborationListener = new CollaborationListener(user, editor, schemaVersion, notebookId);
  }

  // ------------------------------------------------------------------------------
  /**
   * Listens to changes in {@link NotebookVersion}s for the associated {@link Notebook}.
   * This must be called once and only once until {@link #shutdown()} is called (an
   * error is thrown if already initialized).
   *
   * @see #shutdown()
   */
  public async initialize() {
    if(this.initialized !== 'not-initialized') throw new ApplicationError('functions/internal', `Editor service already initializing / initialized ${this.logContext()}.`);

    this.initialized = 'initializing';
    await this.collaborationListener.initialize()/*throws on error*/;
    // NOTE:  will remain 'initializing' if an error occurs
    log.info(`Notebook Editor service initialized ${this.logContext()}.`);

    this.initialized = 'initialized';
  }

  /**
   * Stops listening to {@link NotebookVersion} changes for the associated {@link Notebook}.
   * Shutting down an already shut-down (or never {@link #initialize()}d) service
   * has no effect. This is required.
   *
   * @see #initialize()
   */
  public shutdown() {
    if(this.initialized === 'not-initialized') { log.warn(`Editor service never initialized ${this.logContext()}.`); return/*nothing to do*/; }

    log.info(`Shutting down Notebook Editor service ...`);
    this.collaborationListener.shutdown();

    this.initialized = 'not-initialized';
  }

  // == Observable ================================================================
  /**
   * @returns an Observable over a boolean that indicates whether the there are
   *         changes to the Notebook that have not been written yet
   */
  public onPendingWrites$(): Observable<boolean> {
    return this.collaborationListener.onPendingWrites$();
  }

  // ------------------------------------------------------------------------------
  /**
   * @returns an Observable over all Users (including the current User) that are
   *         currently viewing the Notebook
   */
  public onUsers$(): Observable<NotebookUsers> {
    return this.collaborationListener.onUsers$();
  }

  // == Editor ====================================================================
  /**
   * @param editor the new {@link Editor} that this service will listen to
   */
  public updateEditor(editor: Editor) {
    if(this.editor !== editor) log.error(`Unexpected editor change ${this.logContext()}.`);
  }

  // ------------------------------------------------------------------------------
  /**
   * @returns the index of the {@link NotebookVersion} that was last updated in the
   *          Editor
   */
  public getVersionIndex() {
    if(this.initialized !== 'initialized') log.warn(`Editor service never initialized or still initializing ${this.logContext()}.`);
    // FIXME: this isn't right since the Editor's index may point to a version that
    //        hasn't been 'committed' yet. This should actually do one of two things:
    //        let the caller know that the last Edit hasn't been 'committed' yet and
    //        return only the last written version
    return this.collaborationListener.getEditorIndex();
  }

  // == Server-side Execute =======================================================
  /**
   * @param execute identifies the {@link Notebook} by {@link NotebookIdentifier}
   *        and specific D2AN node by {@link NodeIdentifier}, includes the content
   *        of the D2AN node with the replace text that is going to replaced.
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the Editor of the Notebook
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link Notebook} or if the specified {@link NodeIdentifier} does not
   *   represent a known DAN node.
   * - `invalid-argument` if the specified content or replace is not valid (e.g. empty)
   *   or if the replace text is not present in the content.
   * - `data/deleted` if the {@link Notebook} has already been flagged as deleted
   * - `datastore/write` if there was an error updating the share for the Notebook
   */
  // TODO: think through naming. It's interesting that all of the various Extensions
  //       need to express their server-side goo through this single service
  public async executeDemo2AsyncNode(execute: NotebookEditorDemo2AsyncNode_Execute) {
    await notebookEditorDemo2AsyncNodeExecute(execute);
  }

  /**
   * @param execute identifies the {@link Notebook} by {@link NotebookIdentifier}
   *        and specific DAN node by {@link NodeIdentifier}, includes the combined
   *        content of all of the Code Blocks associated with the Node along with
   *        their corresponding hashes.
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the Editor of the Notebook
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link Notebook} or if the specified {@link NodeIdentifier} does not
   *   represent a known DAN node.
   * - `invalid-argument` if the specified content or hashes is not valid (e.g. empty)
   * - `data/deleted` if the {@link Notebook} has already been flagged as deleted
   * - `datastore/write` if there was an error updating the share for the Notebook
   */
  // TODO: think through naming. It's interesting that all of the various Extensions
  //       need to express their server-side goo through this single service
  public async executeDemoAsyncNode(execute: NotebookEditorDemoAsyncNode_Execute) {
    await notebookEditorDemoAsyncNodeExecute(execute);
  }

  // == Logging ===================================================================
  private logContext() { return `for Notebook (${this.notebookId}) for User (${this.user.userId})`; }
}

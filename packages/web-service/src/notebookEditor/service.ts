import { Editor } from '@tiptap/core';
import { Observable } from 'rxjs';

import { AuthedUser, NotebookIdentifier, NotebookSchemaVersion } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { ApplicationError } from '../util';
import { VersionListener } from './VersionListener';

const log = getLogger(ServiceLogger.NOTEBOOK_EDITOR);

// ********************************************************************************
export class NotebookEditorService {
  protected initialized: 'not-initialized' | 'initializing' | 'initialized' = 'not-initialized';

  //...............................................................................
  protected readonly versionListener: VersionListener;

  // == Lifecycle =================================================================
  /**
   * Creates an Editor service for the specific {@link NotebookSchemaVersion} and
   * {@link NotebookIdentifier}.
   *
   * @see #initialize()
   * @see #shutdown()
   */
  public constructor(private readonly user: AuthedUser, private editor: Editor, schemaVersion: NotebookSchemaVersion, private readonly notebookId: NotebookIdentifier) {
    this.versionListener = new VersionListener(user, editor, schemaVersion, notebookId);
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
    await this.versionListener.initialize()/*throws on error*/;
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
    this.versionListener.shutdown();

    this.initialized = 'not-initialized';
  }

  // == Observable ================================================================
  /**
   * @returns an Observable over a boolean that indicates whether the there are
   *         changes to the Notebook that have not been written yet
   */
  public onPendingWrites$(): Observable<boolean> {
    return this.versionListener.onPendingWrites$();
  }

  // == Editor ====================================================================
  /**
   * @param editor the new {@link Editor} that this service will listen to
   */
  public updateEditor(editor: Editor) {
console.error(`match`, this.editor === editor);
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
    return this.versionListener.getEditorIndex();
  }

  // == Logging ===================================================================
  private logContext() { return `for Notebook (${this.notebookId}) for User (${this.user.userId})`; }
}

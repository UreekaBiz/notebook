import { lastValueFrom, Observable } from 'rxjs';

import { Notebook, NotebookIdentifier, NotebookRole, NotebookTuple, ObjectTuple, PublishedNotebook, PublishedNotebookIdentifier, PublishedNotebookTuple, UserIdentifier } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { ApplicationError } from '../util/error';
import { Scrollable, scrollableQuery } from '../util/observableScrolledCollection';
import { notebookQuery, publishedNotebookQuery } from './datastore';
import { notebookCreate, notebookDelete, notebookShare, publishNotebook } from './function';
import { notebookById$, notebookOnceById$,  notebooksQuery$, publishedNotebookById$, publishedNotebookOnceById$, publishedNotebooksQuery$ } from './observable';
import { Notebook_Create, NotebookFilter, PublishedNotebook_Create, PublishedNotebookFilter } from './type';

const log = getLogger(ServiceLogger.NOTEBOOK);

// ********************************************************************************
export class NotebookService {
  protected static readonly DEFAULT_SCROLL_SIZE = 24/*guess*/;

  // == Singleton =================================================================
  private static singleton: NotebookService;
  public static create() { return (NotebookService.singleton = new NotebookService()); }
  public static getInstance() { return NotebookService.singleton; }

  // == Lifecycle =================================================================
  protected constructor() {/*nothing at this time*/}
  public shutdown() {
    log.info(`Shutting down Notebook service ...`);
  }

  // == Observables ===============================================================
  // -- Notebook ------------------------------------------------------------------
  /**
   * @param filter the fields that are optionally filtered and sorted on
   * @param scrollSize the number of Notebooks returned per batch
   * @returns {@link Scrollable} over the collection of {@link Notebooks}
   */
  public onNotebooks(filter: NotebookFilter, scrollSize: number = NotebookService.DEFAULT_SCROLL_SIZE): Scrollable<NotebookTuple> {
    return scrollableQuery(notebookQuery(filter), notebooksQuery$, scrollSize,
                           `Filtered Notebooks (${JSON.stringify(filter)})`);
  }

  /**
   * @param notebookId the {@link NotebookIdentifier} of the desired {@link Notebook}
   * @returns Observable over {@link Notebook} with the specified identifier. If
   *          no such Notebook exists then `null` is returned. Note that the Notebook
   *          _may be_ soft deleted {@link Notebook#deleted}.
   */
  public onNotebook$(notebookId: NotebookIdentifier): Observable<ObjectTuple<NotebookIdentifier, Notebook | null/*not found*/>> {
    return notebookById$(notebookId);
  }

  // -- Published Notebook --------------------------------------------------------
  /**
   * @param filter the fields that are optionally filtered and sorted on
   * @param scrollSize the number of Published Notebooks returned per batch
   * @returns {@link Scrollable} over the collection of {@link PublishedNotebooks}
   */
  public onPublishedNotebooks(filter: PublishedNotebookFilter, scrollSize: number = NotebookService.DEFAULT_SCROLL_SIZE): Scrollable<PublishedNotebookTuple> {
    return scrollableQuery(publishedNotebookQuery(filter), publishedNotebooksQuery$, scrollSize,
                           `Filtered Published Notebooks (${JSON.stringify(filter)})`);
  }

  /**
   * @param notebookId the {@link NotebookIdentifier} of the desired {@link PublishedNotebook}
   * @returns Observable over the {@link PublishedNotebook} with the specified
   *          identifier. If no such Published Notebook exists then `null` is returned.
   */
  public onPublishedNotebook$(notebookId: NotebookIdentifier): Observable<ObjectTuple<PublishedNotebookIdentifier, PublishedNotebook | null/*not found*/>> {
    return publishedNotebookById$(notebookId);
  }

  // == Read ======================================================================
  // -- Notebook ------------------------------------------------------------------
  /**
   * @param notebookId the {@link NotebookIdentifier} of the desired {@link Notebook}
   *  @returns the {@link Notebook} for the specified {@link NotebookIdentifier}. Note
   *           that the Notebook _may be_ soft deleted {@link Notebook#deleted}.
   *  @throws {@link ApplicationError}
   *  - `permission-denied` if the calling User does not have access to the
   *    specified identified {@link Notebook}
   *  - `not-found` if the specified {@link NotebookIdentifier} does not represent
   *    known {@link Notebook}
   */
  public async getNotebook(notebookId: NotebookIdentifier): Promise<Notebook> {
    const notebook = await lastValueFrom(notebookOnceById$(notebookId));
    if(notebook === null/*not-found*/) throw new ApplicationError('functions/not-found', `Could not find Notebook for Notebook Id (${notebookId}).`);
    // TODO: test 'permission-denied' case!
    return notebook;
  }

  // -- Published Notebook --------------------------------------------------------
  /**
   * @param notebookId the {@link PublishedNotebookIdentifier} of the desired
   *        {@link PublishedNotebook}
   *  @returns the {@link PublishedNotebook} for the specified
   *           {@link PublishedNotebookIdentifier}. Note that the PublishedNotebook
   *           _may be_ soft deleted {@link PublishedNotebook#delete}.
   *  @throws {@link ApplicationError}
   *  - `permission-denied` if the calling User does not have access to the
   *    specified identified {@link PublishedNotebook}
   *  - `not-found` if the specified {@link PublishedNotebookIdentifier} does not represent
   *    known {@link PublishedNotebook}
   */
  public async getPublishedNotebook(notebookId: PublishedNotebookIdentifier): Promise<PublishedNotebook> {
    const publishedNotebook = await lastValueFrom(publishedNotebookOnceById$(notebookId));
    if(publishedNotebook == null/*not-found*/) throw new ApplicationError('functions/not-found', `Could not find Notebook for Notebook Id (${notebookId}).`);
    // TODO: test 'permission-denied' case!
    return publishedNotebook;
  }

  // == CUD =======================================================================
  /**
   * @param create the Notebook that is to be created
   * @returns the {@link NotebookIdentifier} for the created {@link Notebook}
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not logged in
   * - `datastore/write` if there was an error creating the {@link Notebook}
   */
  public async createNotebook(create: Notebook_Create): Promise<NotebookIdentifier> {
    const result = await notebookCreate(create);
    return result.data;
  }

  /**
   * @param notebookId the {@link NotebookIdentifier} of the {@link Notebook} that is
   *         to be deleted
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the creator of the Notebook
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link Notebook}
   * - `data/deleted` if the {@link Notebook} has already been flagged as deleted
   * - `datastore/write` if there was an error setting the deleted flag on the {@link Notebook}
   */
  public async deleteNotebook(notebookId: NotebookIdentifier) {
    await notebookDelete({ notebookId });
  }

  // == Share =====================================================================
  /**
   * Updates the share for the Notebook with the specified {@link NotebookIdentifier}.
   * This cannot be used to change the {@link NotebookRole#Creator} of the Notebook.
   *
   * @param share identifies the {@link Notebook} by {@link NotebookIdentifier} that
   *        is to be shared and the map of {@link UserIdentifier}s to {@link NotebookRole}s
   *        that defines the all sharing Roles for the {@link Notebook}
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the creator of the Notebook
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link Notebook}
   * - `invalid-argument` if caller is not identified as the creator of the Notebook
   *   or that there is no or more than one creator identified or there are more
   *   than {@link #MAX_NOTEBOOK_SHARE_USERS} identified
   * - `datastore/write` if there was an error updating the share for the Notebook
   */
  public async shareNotebook(share: { notebookId: NotebookIdentifier, userRoles: Map<UserIdentifier, NotebookRole> }) {
    await notebookShare({ notebookId: share.notebookId, userRoles: Object.fromEntries(share.userRoles) });
  }

  // == Publish ===================================================================
  /**
   * @param notebookId the {@link NotebookIdentifier} of the {@link Notebook} that is
   *         to be published
   * @param version the version of the {@link Notebook} that is to be published
   * @throws a {@link ApplicationError}:
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link Notebook} or it the specified version does not represent a known
   *   {@link NotebookVersion}
   * - `data/deleted` if the {@link Notebook} has already been flagged as deleted (FIXME!!!!)
   * - `datastore/write` if there was an error setting the deleted flag on the {@link Notebook} (FIXME!!!)
   */
  public async publishNotebook(create: PublishedNotebook_Create) {
    await publishNotebook(create);
  }
}

import { lastValueFrom, Observable } from 'rxjs';

import { Notebook, NotebookIdentifier, NotebookPublishedContent, NotebookPublishedTuple, NotebookTuple, ObjectTuple, ShareRole, UserIdentifier } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { ApplicationError } from '../util/error';
import { scrollableQuery, Scrollable } from '../util/observableScrolledCollection';
import { notebookPublishedQuery, notebookQuery } from './datastore';
import { notebookCopy, notebookCreate, notebookDelete, notebookHashtag, notebookPublish, notebookShare } from './function';
import { notebookMap$, notebookOnceById$, notebookPublishedContentOnceById$, notebookPublishedContentTupleById$, notebookPublishedsQuery$, notebooksQuery$, notebookTupleById$ } from './observable';
import { NotebookFilter, NotebookPublishedFilter, Notebook_Copy, Notebook_Create, Notebook_Hashtag, Notebook_Publish } from './type';

const log = getLogger(ServiceLogger.NOTEBOOK);

// for Published Notebooks, a distinct differentiation is made between the list of
// Published Notebooks and a single Published Notebook. Lists *never* contain the
// content (to keep their sizes small). Single requests *always* contain the content.
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

  // == Observable ================================================================
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
   * @param filter the fields that are optionally filtered and sorted on
   * @returns an Observable over a map of {@link NotebookIdentifier} to {@link Notebook}
   */
  public onNotebookMap$(filter: NotebookFilter): Observable<Map<NotebookIdentifier, Notebook>> {
    return notebookMap$(filter);
  }

  /**
   * @param notebookId the {@link NotebookIdentifier} of the desired {@link Notebook}
   * @returns Observable over {@link Notebook} with the specified identifier. If
   *          no such Notebook exists then `null` is returned. Note that the Notebook
   *          _may be_ soft deleted {@link Notebook#deleted}.
   */
  public onNotebook$(notebookId: NotebookIdentifier): Observable<ObjectTuple<NotebookIdentifier, Notebook | null/*not found*/>> {
    return notebookTupleById$(notebookId);
  }

  // -- Notebook Published --------------------------------------------------------
  /**
   * @param filter the fields that are optionally filtered and sorted on
   * @param scrollSize the number of Published Notebooks returned per batch
   * @returns {@link Scrollable} over the collection of {@link PublishedNotebooks}
   */
  // NOTE: a list so the content is explicitly not included
  public onPublishedNotebooks(filter: NotebookPublishedFilter, scrollSize: number = NotebookService.DEFAULT_SCROLL_SIZE): Scrollable<NotebookPublishedTuple> {
    return scrollableQuery(notebookPublishedQuery(filter), notebookPublishedsQuery$, scrollSize,
                           `Filtered Published Notebooks (${JSON.stringify(filter)})`);
  }

  /**
   * @param notebookId the {@link NotebookIdentifier} of the desired {@link NotebookPublishedContent}
   * @returns Observable over the {@link NotebookPublishedContent} with the specified
   *          identifier. If no such Published Notebook exists then `null` is returned.
   */
  // NOTE: a single entry so that the content *is* included
  public onPublishedNotebook$(notebookId: NotebookIdentifier): Observable<ObjectTuple<NotebookIdentifier, NotebookPublishedContent | null/*not found*/>> {
    return notebookPublishedContentTupleById$(notebookId);
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
   * @param notebookId the {@link NotebookIdentifier} of the desired {@link NotebookPublishedContent}
   * @returns the {@link NotebookPublishedContent} for the specified {@link NotebookIdentifier}
   * @throws {@link ApplicationError}
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link NotebookPublishedContent} (which could mean that either the associated
   *   Notebook was deleted or that the Notebook is no longer published)
   */
  // NOTE: a single entry so that the content *is* included
  public async getPublishedNotebook(notebookId: NotebookIdentifier): Promise<NotebookPublishedContent> {
    const publishedNotebook = await lastValueFrom(notebookPublishedContentOnceById$(notebookId));
    if(publishedNotebook == null/*not-found*/) throw new ApplicationError('functions/not-found', `Could not find Published Notebook for Notebook Id (${notebookId}).`);
    return publishedNotebook;
  }

  // == Create / Delete ===========================================================
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
   * @param copy the Notebook that is to be copied
   * @returns the {@link NotebookIdentifier} for the created {@link Notebook}. The
   *          Shares, Labels and Published-state from the original Notebook are
   *          *not* copied.
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not logged in or is not at least a
   *   viewer of the Notebook that is to be copied
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link Notebook}
   * - `datastore/write` if there was an error creating the {@link Notebook}
   */
  public async copyNotebook(copy: Notebook_Copy): Promise<NotebookIdentifier> {
    const result = await notebookCopy(copy);
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

  // == Hashtag =====================================================================
  /**
   * Updates the hashtags for the Notebook with the specified {@link NotebookIdentifier}.
   *
   * @param hashtag identifies the {@link Notebook} by {@link NotebookIdentifier} that
   *        is to be shared and the set (as a list) of normalized hashtags. Hashtags
   *        do *not* include the leading '#' character. They are normalized and
   *        duplicated server-side for sanity. The complete desired set is specified.
   *        If hashtags are to be removed then simply submit the set without those
   *        hashtags. To remove all hashtags then submit an empty list.
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the creator of the Notebook
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link Notebook}
   * - `invalid-argument` if there are more than {@link #MAX_NOTEBOOK_HASHTAGS} specified
   * - `data/deleted` if the {@link Notebook} has already been flagged as deleted
   * - `datastore/write` if there was an error updating the share for the Notebook
   */
  public async hashtagNotebook(hashtag: Notebook_Hashtag) {
    await notebookHashtag(hashtag);
  }

  // == Share =====================================================================
  /**
   * Updates the share for the Notebook with the specified {@link NotebookIdentifier}.
   * This cannot be used to change the {@link ShareRole#Creator} of the Notebook.
   *
   * @param share identifies the {@link Notebook} by {@link NotebookIdentifier} that
   *        is to be shared and the map of {@link UserIdentifier}s to {@link ShareRole}s
   *        that defines the all sharing Roles for the {@link Notebook}
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the creator of the Notebook
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link Notebook}
   * - `invalid-argument` if caller is not identified as the creator of the Notebook
   *   or that there is no or more than one creator identified or there are more
   *   than {@link #MAX_NOTEBOOK_SHARE_USERS} identified
   * - `data/deleted` if the {@link Notebook} has already been flagged as deleted
   * - `datastore/write` if there was an error updating the share for the Notebook
   */
  public async shareNotebook(share: { notebookId: NotebookIdentifier; userRoles: Map<UserIdentifier, ShareRole>; }) {
    await notebookShare({ notebookId: share.notebookId, userRoles: Object.fromEntries(share.userRoles) });
  }

  // == Publish ===================================================================
  /**
   * @param publish identifies the {@link Notebook} by {@link NotebookIdentifier}
   *        and the index of the {@link Version} that is to be published
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the creator of the Notebook
   * - `not-found` if the specified {@link NotebookIdentifier} does not represent a
   *   known {@link Notebook} or it the specified version does not represent a known
   *   {@link NotebookVersion}
   * - `data/deleted` if the {@link Notebook} has already been flagged as deleted
   * - `datastore/write` if there was an error setting the deleted flag on the {@link Notebook} (FIXME!!!)
   */
  public async publishNotebook(publish: Notebook_Publish) {
    await notebookPublish(publish);
  }
}

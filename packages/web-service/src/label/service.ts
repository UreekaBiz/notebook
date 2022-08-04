import { lastValueFrom, Observable } from 'rxjs';

import { Label, LabelIdentifier, LabelTuple, ObjectTuple, LabelPublished, ShareRole, UserIdentifier, NotebookIdentifier, LabelNotebookTuple, LabelPublishedTuple } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { ApplicationError } from '../util/error';
import { Scrollable, scrollableQuery } from '../util/observableScrolledCollection';
import { labelQuery, labelPublishedQuery, labelNotebookQuery } from './datastore';
import { labelCreate, labelDelete, labelNotebookAdd, labelNotebookRemove, labelNotebookReorder, labelShare, labelUpdate } from './function';
import { labelById$, labelOnceById$,  labelsQuery$, labelPublishedById$, labelPublishedOnceById$, labelPublishedsQuery$, labelNotebooksQuery$ } from './observable';
import { Label_Create, Label_Update, LabelFilter, LabelPublishedFilter } from './type';

const log = getLogger(ServiceLogger.LABEL);

// ********************************************************************************
export class LabelService {
  protected static readonly DEFAULT_SCROLL_SIZE = 24/*guess*/;

  // == Singleton =================================================================
  private static singleton: LabelService;
  public static create() { return (LabelService.singleton = new LabelService()); }
  public static getInstance() { return LabelService.singleton; }

  // == Lifecycle =================================================================
  protected constructor() {/*nothing at this time*/}
  public shutdown() {
    log.info(`Shutting down Label service ...`);
  }

  // == Observables ===============================================================
  // -- Label ---------------------------------------------------------------------
  /**
   * @param filter the fields that are optionally filtered and sorted on
   * @param scrollSize the number of Labels returned per batch
   * @returns {@link Scrollable} over the collection of {@link Labels}
   */
  public onLabels(filter: LabelFilter, scrollSize: number = LabelService.DEFAULT_SCROLL_SIZE): Scrollable<LabelTuple> {
    return scrollableQuery(labelQuery(filter), labelsQuery$, scrollSize,
                           `Filtered Labels (${JSON.stringify(filter)})`);
  }

  /**
   * @param labelId the {@link LabelIdentifier} for which the {@link Label}
   *         is desired
   * @returns Observable over {@link Label} with the specified identifier. If
   *          no such Label exists then `null` is returned. Note that the Label
   *          _may be_ soft deleted {@link Label#deleted}.
   */
  public onLabel$(labelId: LabelIdentifier): Observable<ObjectTuple<LabelIdentifier, Label | null/*not found*/>> {
    return labelById$(labelId);
  }

  // .. Notebook ..................................................................
  /**
   * @param labelId the identifier of the {@link Label} for which the {@link Notebook}s
   *        are desired
   * @param scrollSize the number of Notebooks returned per batch
   * @returns {@link Scrollable} over the collection of {@link LabelNotebook}s
   */
  public onNotebooks(labelId: LabelIdentifier, scrollSize: number = LabelService.DEFAULT_SCROLL_SIZE): Scrollable<LabelNotebookTuple> {
    return scrollableQuery(labelNotebookQuery(labelId), labelNotebooksQuery$, scrollSize,
                           `Label Notebooks (${labelId}})`);
  }

  // -- Label Published -----------------------------------------------------------
  /**
   * @param filter the fields that are optionally filtered and sorted on
   * @param scrollSize the number of Published Labels returned per batch
   * @returns {@link Scrollable} over the collection of {@link LabelPublisheds}
   */
  public onLabelPublisheds(filter: LabelPublishedFilter, scrollSize: number = LabelService.DEFAULT_SCROLL_SIZE): Scrollable<LabelPublishedTuple> {
    return scrollableQuery(labelPublishedQuery(filter), labelPublishedsQuery$, scrollSize,
                           `Filtered Published Labels (${JSON.stringify(filter)})`);
  }

  /**
   * @param labelId the {@link LabelIdentifier} for which the {@link LabelPublished}
   *         is desired
   * @returns Observable over the {@link LabelPublished} with the specified identifier.
   *          If no such Published Label exists then `null` is returned
   */
  public onLabelPublished$(labelId: LabelIdentifier): Observable<ObjectTuple<LabelIdentifier, LabelPublished | null/*not found*/>> {
    return labelPublishedById$(labelId);
  }

  // == Read ======================================================================
  // -- Label ---------------------------------------------------------------------
  /**
   * @param labelId the {@link LabelIdentifier} for which the {@link Label}
   *         is desired
   *  @returns the {@link Label} for the specified {@link LabelIdentifier}. Note
   *           that the Label _may be_ soft deleted {@link Label#deleted}.
   *  @throws {@link ApplicationError}
   *  - `permission-denied` if the calling User does not have access to the
   *    specified identified {@link Label}
   *  - `not-found` if the specified {@link LabelIdentifier} does not represent
   *    known {@link Label}
   */
  public async getLabel(labelId: LabelIdentifier): Promise<Label> {
    const label = await lastValueFrom(labelOnceById$(labelId));
    if(label === null/*not-found*/) throw new ApplicationError('functions/not-found', `Could not find Label for Label Id (${labelId}).`);
    // TODO: test 'permission-denied' case!
    return label;
  }

  // -- Label Published -----------------------------------------------------------
  /**
   * @param labelId the {@link LabelIdentifier} for which the
   *         {@link LabelPublished} is desired
   *  @returns the {@link LabelPublished} for the specified
   *           {@link LabelIdentifier}. Note that the LabelPublished
   *           _may be_ soft deleted {@link LabelPublished#delete}.
   *  @throws {@link ApplicationError}
   *  - `permission-denied` if the calling User does not have access to the
   *    specified identified {@link LabelPublished}
   *  - `not-found` if the specified {@link LabelIdentifier} does not represent
   *    known {@link LabelPublished}
   */
  public async getLabelPublished(labelId: LabelIdentifier): Promise<LabelPublished> {
    const labelPublished = await lastValueFrom(labelPublishedOnceById$(labelId));
    if(labelPublished == null/*not-found*/) throw new ApplicationError('functions/not-found', `Could not find Label for Label Id (${labelId}).`);
    // TODO: test 'permission-denied' case!
    return labelPublished;
  }

  // == CUD =======================================================================
  /**
   * @param create the Label that is to be created
   * @returns the {@link LabelIdentifier} for the created {@link Label}
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not logged in
   * - `invalid-argument` if the specified name is not valid (e.g. empty)
   * - `datastore/write` if there was an error creating the {@link Label}
   */
  public async createLabel(create: Label_Create): Promise<LabelIdentifier> {
    const result = await labelCreate(create);
    return result.data;
  }

  /**
   * @param update the Label that is to be updated. Setting a Label's visibility
   *        to {@link LabelVisibility#Public} makes it visible to all Users (i.e.
   *        publish it). Setting a Label's visibility to {@link LabelVisibility#Private}
   *        makes it visible to only the User who created it. Changing the visibility
   *        of a Label has *no* effect on the Notebooks that are associated with it
   *        (e.g. setting a Label to 'public' does *not* publish the associated
   *        Notebooks).
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not logged in or is not the creator of
   *   the {@link Label}
   * - `not-found` if the {@link LabelIdentifier} does not represent a known {@link Label}
   * - `invalid-argument` if the specified name is not valid (e.g. empty)
   * - `datastore/write` if there was an error updating the {@link Label}
   * @see #addNotebook()
   * @see #removeNotebook()
   * @see #reorderNotebooks()
   * @see #shareLabel()
   */
  public async updateLabel(update: Label_Update) {
    await labelUpdate(update);
  }

  /**
   * @param labelId the {@link LabelIdentifier} of the {@link Label} that is
   *         to be deleted
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not logged in or is not the creator of
   *   the {@link Label}
   * - `not-found` if the {@link LabelIdentifier} does not represent a known {@link Label}
   * - `datastore/write` if there was an error setting the deleted flag on the {@link Label}
   */
  public async deleteLabel(labelId: LabelIdentifier) {
    await labelDelete({ labelId });
  }

  // -- Notebook ------------------------------------------------------------------
  /**
   * @param labelId the identifier of the {@link Label} that is to have a Notebook
   *        associated with it
   * @param notebookId the identifier of the {@link Notebook} that is to be
   *        associated with the Label. The Notebook is added to the end of the
   *        order if it not already associated with the Label. If the Notebook is
   *        already associated with the Label then this has no effect (including
   *        that the order is not changed).
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the creator of the Label
   * - `not-found` if the specified {@link LabelIdentifier} does not represent a
   *   known {@link Label} or if the specified {@link NotebookIdentifier} does not
   *   represent a known {@link Notebook}
   * - `datastore/write` if there was an error associating the Notebook with the Label
   * @see #removeNotebook()
   * @see #reorderNotebooks()
   */
  public async addNotebook(labelId: LabelIdentifier, notebookId: NotebookIdentifier) {
    await labelNotebookAdd({ labelId, notebookId });
  }

  /**
   * @param labelId the identifier of the {@link Label} that is to have a Notebook
   *        disassociated from it
   * @param notebookId the identifier of the {@link Notebook} that is to be
   *        disassociated from the Label. If the Notebook isn't associated with
   *        the Label then this has no effect
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the creator of the Label
   * - `not-found` if the specified {@link LabelIdentifier} does not represent a
   *   known {@link Label}
   * - `datastore/write` if there was an error associating the Notebook with the Label
   * @see #addNotebook()
   * @see #reorderNotebooks()
   */
  public async removeNotebook(labelId: LabelIdentifier, notebookId: NotebookIdentifier) {
    await labelNotebookRemove({ labelId, notebookId });
  }

  // ..............................................................................
  /**
   * @param labelId the identifier of the {@link Label} that is to have a its
   *        Notebook order changed
   * @param notebookOrder the desired order of the Notebooks associated with the
   *        Label. The specified list completely replaces the existing order. This
   *        means that this operation can be used to both reorder as well as add
   *        and remove Notebooks. Any identifier that does not represent a known
   *        Notebook is silently ignored. If any identifier is duplicated then
   *        the first occurrence (in its position) is used.
   * @returns the resulting ordered list of Notebooks. This is useful to know if
   *          any Notebook identifiers where were invalid, not found or duplicated.
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the creator of the Label
   * - `not-found` if the specified {@link LabelIdentifier} does not represent a
   *   known {@link Label}
   * - `datastore/write` if there was an error associating the Notebook with the Label
   * @see #addNotebook()
   * @see #removeNotebook()
   */
  public async reorderNotebook(labelId: LabelIdentifier, notebookOrder: NotebookIdentifier[]): Promise<NotebookIdentifier[]> {
    const result = await labelNotebookReorder({ labelId, order: notebookOrder });
    return result.data;
  }

  // == Share =====================================================================
  /**
   * Updates the share for the Label with the specified {@link LabelIdentifier}.
   * This cannot be used to change the {@link ShareRole#Creator} of the Label.
   *
   * @param share identifies the {@link Label} by {@link LabelIdentifier} that
   *        is to be shared and the map of {@link UserIdentifier}s to {@link ShareRole}s
   *        that defines the all sharing Roles for the {@link Label}
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not the creator of the Label
   * - `not-found` if the specified {@link LabelIdentifier} does not represent a
   *   known {@link Label}
   * - `invalid-argument` if caller is not identified as the creator of the Label
   *   or that there is no or more than one creator identified or there are more
   *   than {@link #MAX_NOTEBOOK_SHARE_USERS} identified
   * - `datastore/write` if there was an error updating the share for the Label
   */
  public async shareLabel(share: { labelId: LabelIdentifier, userRoles: Map<UserIdentifier, ShareRole> }) {
    await labelShare({ labelId: share.labelId, userRoles: Object.fromEntries(share.userRoles) });
  }

  // == Publish ===================================================================
  // when a Label's visibility is set to 'public' then it is Published. When a Label's
  // visibility is set to 'private' then it is unpublished
}
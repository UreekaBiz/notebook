import { iif, map, of, switchMap, throwError } from 'rxjs';

import { isDefined, isTupleNotNull, LabelIdentifier, Label_Storage, LabelPublished_Storage, LabelPublishedTuple, LabelTuple, NotebookIdentifier, NotebookPublishedTuple, NotebookTuple } from '@ureeka-notebook/service-common';

import { notebookPublishedTupleOnceById$, notebookTupleOnceById$ } from '../notebook/observable';
import { ApplicationError } from '../util/error';
import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { ArrayObservable, joinDetail$ } from '../util/observable';
import { QueryObservable } from '../util/observableCollection';
import { documentOnce } from '../util/observableDocument';
import { queryTuples } from '../util/observableTupleCollection';
import { documentTuple } from '../util/observableTupleDocument';
import { labelDocument, labelQuery, labelPublishedDocument, labelPublishedQuery } from './datastore';
import { LabelFilter, LabelPublishedFilter } from './type';

// ********************************************************************************
// == Label =======================================================================
// -- Get -------------------------------------------------------------------------
export const labelOnceById$ = (labelId: LabelIdentifier) =>
  documentOnce(labelDocument(labelId), defaultDocumentConverter);
export const labelById$ = (labelId: LabelIdentifier) =>
  documentTuple(labelDocument(labelId), defaultDocumentTupleConverter);

// -- Notebook --------------------------------------------------------------------
export const labelNotebooks$ = (labelId: LabelIdentifier) =>
  labelOnceById$(labelId)
    .pipe(
      switchMap(label =>
        iif(() => label === null/*not found*/,
          throwError(() => new ApplicationError('functions/not-found', `Could not find Label for Label Id (${labelId}).`)),
          of(label!.notebooks)
        )
      ));

// ................................................................................
// detail-joins Notebook (filtering out any missing Notebooks)
// FIXME: terrible name!
export const notebooksArray$: ArrayObservable<NotebookIdentifier, NotebookTuple> =
  notebookIds =>
      joinDetail$(
        of(notebookIds),
        notebookId => notebookTupleOnceById$(notebookId),
        (_, detail) => isTupleNotNull(detail) ? detail : undefined/*not-found -- filtered below*/
      )
      .pipe(map(results => results.filter(isDefined))/*filter out any not-found Notebooks*/);

// -- Search ----------------------------------------------------------------------
export const labelsQuery$: QueryObservable<Label_Storage, LabelTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const labels$ = (filter: LabelFilter) =>
  queryTuples(labelQuery(filter), defaultTupleConverter);

// == Label Published =============================================================
// -- Get -------------------------------------------------------------------------
export const labelPublishedOnceById$ = (labelId: LabelIdentifier) =>
  documentOnce(labelPublishedDocument(labelId), defaultDocumentConverter);
export const labelPublishedById$ = (labelId: LabelIdentifier) =>
  documentTuple(labelPublishedDocument(labelId), defaultDocumentTupleConverter);

// -- Notebook --------------------------------------------------------------------
export const labelNotebookPublisheds$ = (labelId: LabelIdentifier) =>
  labelPublishedOnceById$(labelId)
    .pipe(
      switchMap(label =>
        iif(() => label === null/*not found*/,
          throwError(() => new ApplicationError('functions/not-found', `Could not find Published Label for Label Id (${labelId}).`)),
          of(label!.notebooks)
        )
      ));

// ................................................................................
// detail-joins Notebook (filtering out any missing Notebooks)
// FIXME: terrible name!
export const notebookPublishedsArray$: ArrayObservable<NotebookIdentifier, NotebookPublishedTuple> =
  notebookIds =>
      joinDetail$(
        of(notebookIds),
        notebookId => notebookPublishedTupleOnceById$(notebookId),
        (_, detail) => isTupleNotNull(detail) ? detail : undefined/*not-found -- filtered below*/
      )
      .pipe(map(results => results.filter(isDefined))/*filter out any not-found Published Notebooks*/);

// -- Search ----------------------------------------------------------------------
export const labelPublishedsQuery$: QueryObservable<LabelPublished_Storage, LabelPublishedTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const labelPublisheds$ = (filter: LabelPublishedFilter) =>
  queryTuples(labelPublishedQuery(filter), defaultTupleConverter);

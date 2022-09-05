import { map, of } from 'rxjs';

import { isDefined, isTupleNotNull, NotebookIdentifier, NotebookTuple, Notebook_Storage, NotebookPublishedTuple, NotebookPublished_Storage } from '@ureeka-notebook/service-common';

import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { joinDetail$, ArrayObservable } from '../util/observable';
import { QueryObservable } from '../util/observableCollection';
import { documentOnce } from '../util/observableDocument';
import { queryTuples } from '../util/observableTupleCollection';
import { documentTuple } from '../util/observableTupleDocument';
import { notebookDocument, notebookPublishedContentDocument, notebookPublishedDocument, notebookPublishedQuery, notebookQuery } from './datastore';
import { NotebookFilter, NotebookPublishedFilter } from './type';

// ********************************************************************************
// == Get =========================================================================
// -- Notebook --------------------------------------------------------------------
export const notebookOnceById$ = (notebookId: NotebookIdentifier) =>
  documentOnce(notebookDocument(notebookId), defaultDocumentConverter);
export const notebookTupleOnceById$ = (notebookId: NotebookIdentifier) =>
  documentTuple(notebookDocument(notebookId), defaultDocumentTupleConverter);
export const notebookTupleById$ = (notebookId: NotebookIdentifier) =>
  documentTuple(notebookDocument(notebookId), defaultDocumentTupleConverter);

// .. Id's => Notebooks ...........................................................
// detail-joins Notebook (filtering out any missing Notebooks)
// FIXME: do a smarter inner detail lookup that allows for Notebooks to be no
//        longer visible to the User (i.e. they were un-Shared). Create a union
//        type that specifically expresses a non-visible Notebook.
export const notebookIdsToNotebooks$: ArrayObservable<NotebookIdentifier, NotebookTuple> =
  notebookIds =>
      joinDetail$(
        of(notebookIds),
        notebookId => notebookTupleOnceById$(notebookId)/*FIXME: see FIXME above -- this will need to be passed the User*/,
        (_, detail) => isTupleNotNull(detail) ? detail : undefined/*not-found -- filtered below*/
      )
      .pipe(map(results => results.filter(isDefined))/*filter out any not-found Notebooks*/);

// -- Notebook Published ----------------------------------------------------------
// NOTE: these are used in cases (e.g. Label => Notebook) where there is only a
//       NotebookIdentifier and must join to NotebookPublished
export const notebookPublishedTupleOnceById$ = (notebookId: NotebookIdentifier) =>
  documentTuple(notebookPublishedDocument(notebookId), defaultDocumentTupleConverter);

// NOTE: single document accessors so the content *is* included
export const notebookPublishedContentOnceById$ = (notebookId: NotebookIdentifier) =>
  documentOnce(notebookPublishedContentDocument(notebookId), defaultDocumentConverter);
export const notebookPublishedContentTupleById$ = (notebookId: NotebookIdentifier) =>
  documentTuple(notebookPublishedContentDocument(notebookId), defaultDocumentTupleConverter);

// .. Id's => Notebooks ...........................................................
// detail-joins Notebook Published (filtering out any missing Notebooks)
export const notebookPublishedIdsToNotebookPublisheds$: ArrayObservable<NotebookIdentifier, NotebookPublishedTuple> =
  notebookIds =>
      joinDetail$(
        of(notebookIds),
        notebookId => notebookPublishedTupleOnceById$(notebookId),
        (_, detail) => isTupleNotNull(detail) ? detail : undefined/*not-found -- filtered below*/
      )
      .pipe(map(results => results.filter(isDefined))/*filter out any not-found Published Notebooks*/);

// == Search ======================================================================
// -- Notebook --------------------------------------------------------------------
export const notebooksQuery$: QueryObservable<Notebook_Storage, NotebookTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const notebooks$ = (filter: NotebookFilter) =>
  queryTuples(notebookQuery(filter), defaultTupleConverter);

// -- Notebook Published ----------------------------------------------------------
// lists of Published Notebooks so the content is explicitly not included
export const notebookPublishedsQuery$: QueryObservable<NotebookPublished_Storage, NotebookPublishedTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const notebookPublisheds$ = (filter: NotebookPublishedFilter) =>
  queryTuples(notebookPublishedQuery(filter), defaultTupleConverter);

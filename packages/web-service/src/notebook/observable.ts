import { NotebookIdentifier, NotebookTuple, Notebook_Storage, NotebookPublishedTuple, NotebookPublished_Storage } from '@ureeka-notebook/service-common';

import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { QueryObservable } from '../util/observableCollection';
import { documentOnce } from '../util/observableDocument';
import { queryTuples } from '../util/observableTupleCollection';
import { documentTuple } from '../util/observableTupleDocument';
import { notebookDocument, notebookPublishedContentDocument, notebookPublishedQuery, notebookQuery } from './datastore';
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

// -- Notebook Published ----------------------------------------------------------
// NOTE: single document accessors so the content *is* included
export const notebookPublishedContentOnceById$ = (notebookId: NotebookIdentifier) =>
  documentOnce(notebookPublishedContentDocument(notebookId), defaultDocumentConverter);
export const notebookPublishedContentTupleById$ = (notebookId: NotebookIdentifier) =>
  documentTuple(notebookPublishedContentDocument(notebookId), defaultDocumentTupleConverter);

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

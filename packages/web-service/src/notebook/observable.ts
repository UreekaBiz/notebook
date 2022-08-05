import { NotebookIdentifier, NotebookTuple, Notebook_Storage, PublishedNotebookIdentifier, PublishedNotebookTuple, PublishedNotebook_Storage } from '@ureeka-notebook/service-common';

import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { QueryObservable } from '../util/observableCollection';
import { documentOnce } from '../util/observableDocument';
import { queryTuples } from '../util/observableTupleCollection';
import { documentTuple } from '../util/observableTupleDocument';
import { notebookDocument, notebookQuery, publishedNotebookDocument, publishedNotebookQuery } from './datastore';
import { NotebookFilter, PublishedNotebookFilter } from './type';

// ********************************************************************************
// == Get =========================================================================
export const notebookOnceById$ = (notebookId: NotebookIdentifier) =>
  documentOnce(notebookDocument(notebookId), defaultDocumentConverter);
export const notebookTupleOnceById$ = (notebookId: NotebookIdentifier) =>
  documentTuple(notebookDocument(notebookId), defaultDocumentTupleConverter);
export const notebookTupleById$ = (notebookId: NotebookIdentifier) =>
  documentTuple(notebookDocument(notebookId), defaultDocumentTupleConverter);

export const publishedNotebookOnceById$ = (notebookId: PublishedNotebookIdentifier) =>
  documentOnce(publishedNotebookDocument(notebookId), defaultDocumentConverter);
export const publishedNotebookTupleById$ = (notebookId: PublishedNotebookIdentifier) =>
  documentTuple(publishedNotebookDocument(notebookId), defaultDocumentTupleConverter);

// == Search ======================================================================
export const notebooksQuery$: QueryObservable<Notebook_Storage, NotebookTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const notebooks$ = (filter: NotebookFilter) =>
  queryTuples(notebookQuery(filter), defaultTupleConverter);

export const publishedNotebooksQuery$: QueryObservable<PublishedNotebook_Storage, PublishedNotebookTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const publishedNotebooks$ = (filter: PublishedNotebookFilter) =>
  queryTuples(publishedNotebookQuery(filter), defaultTupleConverter);

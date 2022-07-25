import { NotebookIdentifier, PublishedNotebookIdentifier } from '@ureeka-notebook/service-common';

import { documentOnce } from '../util/observableDocument';
import { queryTuples } from '../util/observableTupleCollection';
import { documentTuple } from '../util/observableTupleDocument';
import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { notebookDocument, notebookQuery, publishedNotebookDocument, publishedNotebookQuery } from './datastore';
import { NotebookFilter, PublishedNotebookFilter } from './type';

// ********************************************************************************
// == Get =========================================================================
export const notebookOnceById$ = (notebookId: NotebookIdentifier) =>
  documentOnce(notebookDocument(notebookId), defaultDocumentConverter);
export const notebookById$ = (notebookId: NotebookIdentifier) =>
  documentTuple(notebookDocument(notebookId), defaultDocumentTupleConverter);

export const publishedNotebookOnceById$ = (notebookId: PublishedNotebookIdentifier) =>
  documentOnce(publishedNotebookDocument(notebookId), defaultDocumentConverter);
export const publishedNotebookById$ = (notebookId: PublishedNotebookIdentifier) =>
  documentTuple(publishedNotebookDocument(notebookId), defaultDocumentTupleConverter);

// == Search ======================================================================
export const notebooks$ = (filter: NotebookFilter) =>
  queryTuples(notebookQuery(filter), defaultTupleConverter);

export const publishedNotebooks$ = (filter: PublishedNotebookFilter) =>
  queryTuples(publishedNotebookQuery(filter), defaultTupleConverter);

import { LabelIdentifier, LabelTuple, Label_Storage, LabelPublished_Storage, LabelNotebook_Storage, LabelNotebookTuple, LabelPublishedTuple, LabelNotebookPublishedTuple, LabelNotebookPublished_Storage } from '@ureeka-notebook/service-common';

import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { QueryObservable, QuerySnapshotObservable } from '../util/observableCollection';
import { documentOnce } from '../util/observableDocument';
import { queryTuples, snapshotTuplesOnce } from '../util/observableTupleCollection';
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
export const labelNotebooksQuery$: QueryObservable<LabelNotebook_Storage, LabelNotebookTuple> =
  query => queryTuples(query, defaultTupleConverter);

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
export const labelNotebooksPublishedSnapshot$: QuerySnapshotObservable<LabelNotebookPublished_Storage, LabelNotebookPublishedTuple> =
  snapshot => snapshotTuplesOnce(snapshot, defaultTupleConverter);

// -- Search ----------------------------------------------------------------------
export const labelPublishedsQuery$: QueryObservable<LabelPublished_Storage, LabelPublishedTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const labelPublisheds$ = (filter: LabelPublishedFilter) =>
  queryTuples(labelPublishedQuery(filter), defaultTupleConverter);

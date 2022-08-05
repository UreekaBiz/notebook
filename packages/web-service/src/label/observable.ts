import { map } from 'rxjs';

import { isDefined, isTupleNotNull, LabelIdentifier, LabelTuple, Label_Storage, LabelPublished_Storage, LabelNotebook_Storage, LabelNotebookTuple, LabelPublishedTuple, NotebookTuple } from '@ureeka-notebook/service-common';

import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { joinDetail$ } from '../util/observable';
import { QueryObservable, QuerySnapshotObservable } from '../util/observableCollection';
import { documentOnce } from '../util/observableDocument';
import { queryTuples, snapshotTuplesOnce } from '../util/observableTupleCollection';
import { documentTuple } from '../util/observableTupleDocument';
import { labelDocument, labelQuery, labelPublishedDocument, labelPublishedQuery } from './datastore';
import { LabelFilter, LabelPublishedFilter } from './type';
import { notebookTupleOnceById$ } from '../notebook/observable';

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
export const labelNotebooksSnapshot$: QuerySnapshotObservable<LabelNotebook_Storage, LabelNotebookTuple> =
  snapshot => snapshotTuplesOnce(snapshot, defaultTupleConverter);

// ................................................................................
// detail-joins Notebook (filtering out any missing Notebooks)
export const notebooksSnapshot$: QuerySnapshotObservable<LabelNotebook_Storage, NotebookTuple> =
  snapshot => joinDetail$(
                labelNotebooksSnapshot$(snapshot),
                ({ id: notebookId }) => notebookTupleOnceById$(notebookId),
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
export const labelNotebooksPublishedSnapshot$: QuerySnapshotObservable<LabelNotebook_Storage, LabelNotebookTuple> =
  snapshot => snapshotTuplesOnce(snapshot, defaultTupleConverter);

// -- Search ----------------------------------------------------------------------
export const labelPublishedsQuery$: QueryObservable<LabelPublished_Storage, LabelPublishedTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const labelPublisheds$ = (filter: LabelPublishedFilter) =>
  queryTuples(labelPublishedQuery(filter), defaultTupleConverter);

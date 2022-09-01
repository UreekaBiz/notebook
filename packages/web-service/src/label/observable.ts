import { iif, of, switchMap, throwError } from 'rxjs';

import { LabelIdentifier, Label_Storage, LabelPublished_Storage, LabelPublishedTuple, LabelTuple, NotebookIdentifier, UserIdentifier } from '@ureeka-notebook/service-common';

import { ApplicationError } from '../util/error';
import { defaultDocumentConverter, defaultDocumentTupleConverter, defaultTupleConverter } from '../util/firestore';
import { QueryObservable } from '../util/observableCollection';
import { documentOnce } from '../util/observableDocument';
import { queryTuples } from '../util/observableTupleCollection';
import { documentTuple } from '../util/observableTupleDocument';
import { labelDocument, labelQuery, labelPrefixQuery, labelPublishedDocument, labelPublishedQuery, notebookLabelQuery } from './datastore';
import { LabelFilter, LabelPublishedFilter } from './type';

// ********************************************************************************
// == Label =======================================================================
// -- Get -------------------------------------------------------------------------
export const labelOnceById$ = (labelId: LabelIdentifier) =>
  documentOnce(labelDocument(labelId), defaultDocumentConverter);
export const labelById$ = (labelId: LabelIdentifier) =>
  documentTuple(labelDocument(labelId), defaultDocumentTupleConverter);

// -- Notebook --------------------------------------------------------------------
// .. Label => Notebook Identifier ................................................
export const labelNotebookIds$ = (labelId: LabelIdentifier) =>
  labelOnceById$(labelId)
    .pipe(
      switchMap(label =>
        iif(() => label === null/*not found*/,
          throwError(() => new ApplicationError('functions/not-found', `Could not find Label for Label Id (${labelId}).`)),
          of(label!.notebookIds/*explicitly ordered (by design)*/)
        )
      ));

// .. Notebook => Labels ..........................................................
export const notebookLabels$ = (userId: UserIdentifier, notebookId: NotebookIdentifier) =>
  queryTuples(notebookLabelQuery(userId, notebookId), defaultTupleConverter);

// -- Search ----------------------------------------------------------------------
export const labelsQuery$: QueryObservable<Label_Storage, LabelTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const labels$ = (filter: LabelFilter) =>
  queryTuples(labelQuery(filter), defaultTupleConverter);

// -- Typeahead-find Search -------------------------------------------------------
export const typeaheadFindLabels$ = (query: string) =>
  queryTuples(labelPrefixQuery(query), defaultTupleConverter);

// == Label Published =============================================================
// -- Get -------------------------------------------------------------------------
export const labelPublishedOnceById$ = (labelId: LabelIdentifier) =>
  documentOnce(labelPublishedDocument(labelId), defaultDocumentConverter);
export const labelPublishedById$ = (labelId: LabelIdentifier) =>
  documentTuple(labelPublishedDocument(labelId), defaultDocumentTupleConverter);

// -- Notebook --------------------------------------------------------------------
export const labelNotebookPublishedIds$ = (labelId: LabelIdentifier) =>
  labelPublishedOnceById$(labelId)
    .pipe(
      switchMap(label =>
        iif(() => label === null/*not found*/,
          throwError(() => new ApplicationError('functions/not-found', `Could not find Published Label for Label Id (${labelId}).`)),
          of(label!.notebookIds)
        )
      ));

// -- Search ----------------------------------------------------------------------
export const labelPublishedsQuery$: QueryObservable<LabelPublished_Storage, LabelPublishedTuple> =
  query => queryTuples(query, defaultTupleConverter);
export const labelPublisheds$ = (filter: LabelPublishedFilter) =>
  queryTuples(labelPublishedQuery(filter), defaultTupleConverter);

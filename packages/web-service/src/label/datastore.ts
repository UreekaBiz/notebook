import { ref } from 'firebase/database';
import { collection, doc, limit, orderBy, query, where, CollectionReference, Query } from 'firebase/firestore';

import { computeLabelPrefixQueryString, isBlank, nameof, LabelIdentifier, LabelNotebook_Storage, LabelNotebookPublished_Storage, LabelPublished_Storage, Label_Storage, NotebookIdentifier, LABELS, LABEL_NOTEBOOK_PUBLISHEDS, LABEL_NOTEBOOKS, LABEL_PUBLISHEDS, LABEL_SUMMARIES, MAX_LABEL_SEARCH_RESULTS } from '@ureeka-notebook/service-common';

import { database, firestore } from '../util/firebase';
import { buildSortQuery } from '../util/firestore';
import { LabelFilter, LabelPublishedFilter } from './type';

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Label -----------------------------------------------------------------------
export const labelCollection = collection(firestore, LABELS) as CollectionReference<Label_Storage>;
export const labelDocument = (labelId: LabelIdentifier) => doc(labelCollection, labelId);

// .. Label Notebook ..............................................................
export const labelNotebookCollection = (labelId: LabelIdentifier) => collection(labelDocument(labelId), LABEL_NOTEBOOKS) as CollectionReference<LabelNotebook_Storage>;
export const labelNotebookDocument = (labelId: LabelIdentifier, notebookId: NotebookIdentifier) => doc(labelNotebookCollection(labelId), notebookId);

// -- Label Published -------------------------------------------------------------
export const labelPublishedCollection = collection(firestore, LABEL_PUBLISHEDS) as CollectionReference<LabelPublished_Storage>;
export const labelPublishedDocument = (labelId: LabelIdentifier) => doc(labelPublishedCollection, labelId);

// .. Label Notebook Published ....................................................
export const labelNotebookPublishedCollection = (labelId: LabelIdentifier) => collection(labelPublishedDocument(labelId), LABEL_NOTEBOOK_PUBLISHEDS) as CollectionReference<LabelNotebookPublished_Storage>;
export const labelNotebookPublishedDocument = (labelId: LabelIdentifier, notebookId: NotebookIdentifier) => doc(labelNotebookPublishedCollection(labelId), notebookId);

// == Query =======================================================================
// -- Label -----------------------------------------------------------------------
export const labelQuery = (filter: LabelFilter) => {
  let buildQuery = labelCollection as Query<Label_Storage>;

  // filter
  if(!isBlank(filter.name)) {
    // TODO: support substring!!
    buildQuery = query(buildQuery, where(nameof<Label_Storage>('name'), '==', filter.name!));
  } /* else -- 'name' was not specified in the filter */
  // NOTE: these are waterfall'd by design
  if(!isBlank(filter.viewableBy)) {
    buildQuery = query(buildQuery, where(nameof<Label_Storage>('viewers'), 'array-contains', filter.viewableBy!));
  } /* else -- 'createdBy' was not specified in the filter */
  if(!isBlank(filter.editableBy)) {
    buildQuery = query(buildQuery, where(nameof<Label_Storage>('editors'), 'array-contains', filter.editableBy!));
  } /* else -- 'createdBy' was not specified in the filter */
  if(!isBlank(filter.createdBy)) {
    buildQuery = query(buildQuery, where(nameof<Label_Storage>('createdBy'), '==', filter.createdBy!));
  } /* else -- 'createdBy' was not specified in the filter */

  // sort
  buildQuery = buildSortQuery(buildQuery, filter, nameof<Label_Storage>('sortName')/*default sort field*/);

  return buildQuery;
};

// .. Notebook ....................................................................
// TODO: the inability to sort here is another reason to denormalize the Notebook
//       record on LabelNotebook
export const labelNotebookQuery = (labelId: LabelIdentifier) =>
  query(labelNotebookCollection(labelId));

// .. Search (Published) ..........................................................
export const sortedLabelQuery =
  query(labelPublishedCollection, orderBy(nameof<Label_Storage>('name'), 'asc'));

// .. Typeahead-find Search (Published) ...........................................
export const labelPrefixQuery = (queryString: string) =>
  query(sortedLabelQuery, where(nameof<Label_Storage>('searchNamePrefixes'), 'array-contains', computeLabelPrefixQueryString(queryString)),
                          limit(MAX_LABEL_SEARCH_RESULTS/*bound for sanity*/));

// -- Label Published -------------------------------------------------------------
export const labelPublishedQuery = (filter: LabelPublishedFilter) => {
  let buildQuery = labelPublishedCollection as Query<LabelPublished_Storage>;

  // filter
  if(!isBlank(filter.name)) {
    // TODO: support substring!!
    buildQuery = query(buildQuery, where(nameof<LabelPublished_Storage>('name'), '==', filter.name!));
  } /* else -- 'name' was not specified in the filter */
  if(!isBlank(filter.createdBy)) {
    buildQuery = query(buildQuery, where(nameof<LabelPublished_Storage>('createdBy'), '==', filter.createdBy!));
  } /* else -- 'createdBy' was not specified in the filter */

  // sort
  buildQuery = buildSortQuery(buildQuery, filter, nameof<LabelPublished_Storage>('name')/*default sort field*/);

  return buildQuery;
};

// .. Notebook ....................................................................
// TODO: the inability to sort here is another reason to denormalize the Notebook
//       record on LabelNotebook
export const labelNotebookPublishedQuery = (labelId: LabelIdentifier) =>
  query(labelNotebookPublishedCollection(labelId));

// ** RTDB ************************************************************************
// == Collection ==================================================================
// -- Label Summary -------------------------------------------------------------
export const labelSummary = (labelId: LabelIdentifier) => ref(database, `/${LABEL_SUMMARIES}/${labelId}`);

import { collection, doc, limit, orderBy, query, where, CollectionReference, Query } from 'firebase/firestore';

import { computeLabelPrefixQueryString, isBlank, nameof, LabelIdentifier, LabelPublished_Storage, Label_Storage, NotebookIdentifier, UserIdentifier, LABELS, LABEL_PUBLISHEDS, MAX_LABEL_SEARCH_RESULTS } from '@ureeka-notebook/service-common';

import { firestore } from '../util/firebase';
import { buildSortQuery } from '../util/firestore';
import { LabelFilter, LabelPublishedFilter } from './type';

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Label -----------------------------------------------------------------------
export const labelCollection = collection(firestore, LABELS) as CollectionReference<Label_Storage>;
export const labelDocument = (labelId: LabelIdentifier) => doc(labelCollection, labelId);

// -- Label Published -------------------------------------------------------------
export const labelPublishedCollection = collection(firestore, LABEL_PUBLISHEDS) as CollectionReference<LabelPublished_Storage>;
export const labelPublishedDocument = (labelId: LabelIdentifier) => doc(labelPublishedCollection, labelId);

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

// .. Search (Published) ..........................................................
export const sortedLabelQuery =
  query(labelPublishedCollection, orderBy(nameof<Label_Storage>('name'), 'asc'));

// .. Typeahead-find Search (Published) ...........................................
export const labelPrefixQuery = (queryString: string) =>
  query(sortedLabelQuery, where(nameof<Label_Storage>('searchNamePrefixes'), 'array-contains', computeLabelPrefixQueryString(queryString)),
                          limit(MAX_LABEL_SEARCH_RESULTS/*bound for sanity*/));

// .. Notebook ....................................................................
// get all Labels that are visible to the User for the specified Notebook
// NOTE: this doesn't check if the User is a viewer of the Notebook since this
//       exposes no information about the Notebook itself. The most the User can
//       know is what they're allowed to see based on the Labels they have access to
export const notebookLabelQuery = (userId: UserIdentifier, notebookId: NotebookIdentifier) =>
  query(labelCollection, where(nameof<Label_Storage>('notebookIds'), 'array-contains', notebookId),
                         where(nameof<Label_Storage>('viewers'), 'array-contains', userId));

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

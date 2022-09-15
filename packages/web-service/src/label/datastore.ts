import { collection, doc, limit, orderBy, query, where, CollectionReference, Query } from 'firebase/firestore';

import { computeLabelPrefixQueryString, isBlank, nameof, LabelIdentifier, LabelPublished_Storage, Label_Storage, NotebookIdentifier, UserIdentifier, LABELS, LABEL_PUBLISHEDS, MAX_LABEL_SEARCH_RESULTS } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { firestore } from '../util/firebase';
import { buildSortQuery } from '../util/firestore';
import { LabelFilter, LabelPublishedFilter } from './type';

const log = getLogger(ServiceLogger.LABEL);

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

  // filter name
  if(!isBlank(filter.namePrefix)) { /*1st priority*/
    buildQuery = query(buildQuery, where(nameof<Label_Storage>('searchNamePrefixes'), 'array-contains', computeLabelPrefixQueryString(filter.namePrefix!)));
  } else if(!isBlank(filter.name)) { /*2nd priority*/
    buildQuery = query(buildQuery, where(nameof<Label_Storage>('name'), '==', filter.name!));
  } /* else -- neither 'namePrefix' nor 'name' was specified in the filter */

  // filter visibility
  if(filter.visibility) {
    buildQuery = query(buildQuery, where(nameof<Label_Storage>('visibility'), '==', filter.visibility));
  } /* else -- 'visibility' was not specified in the filter */

  // filter viewableBy, editableBy and createdBy
  if(!isBlank(filter.viewableBy)) {
    if(isBlank(filter.namePrefix)) buildQuery = query(buildQuery, where(nameof<Label_Storage>('viewers'), 'array-contains', filter.viewableBy!));
    else log.warn(`Cannot filter by both 'namePrefix' and 'viewableBy' at the same time. Ignoring 'viewableBy' filter.`);
  } else if(!isBlank(filter.editableBy)) {
    if(isBlank(filter.namePrefix)) buildQuery = query(buildQuery, where(nameof<Label_Storage>('editors'), 'array-contains', filter.editableBy!));
    else log.warn(`Cannot filter by both 'namePrefix' and 'editableBy' at the same time. Ignoring 'editableBy' filter.`);
  } else if(!isBlank(filter.createdBy)) {
    buildQuery = query(buildQuery, where(nameof<Label_Storage>('createdBy'), '==', filter.createdBy!));
  } /* else -- 'viewableBy', 'editableBy' or 'createdBy' were not specified in the filter */

  // sort
  buildQuery = buildSortQuery(buildQuery, filter, nameof<Label_Storage>('sortName')/*default sort field*/);

  return buildQuery;
};

// .. Search ......................................................................
export const sortedLabelQuery =
  query(labelCollection, orderBy(nameof<Label_Storage>('name'), 'asc'));

// .. Typeahead-find Search .......................................................
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
                         where(nameof<Label_Storage>('createdBy'), '==', userId));
                         // FIXME: really really want this so that Labels can be shared
                         //where(nameof<Label_Storage>('viewers'), 'array-contains', userId));

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

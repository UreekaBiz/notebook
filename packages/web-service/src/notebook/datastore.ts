import { collection, doc, query, where, CollectionReference, Query } from 'firebase/firestore';

import { isBlank, nameof, normalizeHashtag, Notebook_Storage, NotebookIdentifier, NotebookPublished_Storage, NotebookPublishedContent, MAX_ARRAY_CONTAINS_ANY, NOTEBOOKS, NOTEBOOK_PUBLISHEDS, NOTEBOOK_PUBLISHED_CONTENTS } from '@ureeka-notebook/service-common';

import { firestore } from '../util/firebase';
import { buildSortQuery } from '../util/firestore';
import { NotebookFilter, NotebookPublishedFilter } from './type';

// ** Firestore *******************************************************************
// == Collection ==================================================================
// -- Notebook ---------------------------------------------------------------------
export const notebookCollection = collection(firestore, NOTEBOOKS) as CollectionReference<Notebook_Storage>;
export const notebookDocument = (notebookId: NotebookIdentifier ) => doc(notebookCollection, notebookId);

// -- Notebook Published ----------------------------------------------------------
export const notebookPublishedCollection = collection(firestore, NOTEBOOK_PUBLISHEDS) as CollectionReference<NotebookPublished_Storage>;
export const notebookPublishedDocument = (notebookId: NotebookIdentifier) => doc(notebookPublishedCollection, notebookId);

export const notebookPublishedContentCollection = collection(firestore, NOTEBOOK_PUBLISHED_CONTENTS) as CollectionReference<NotebookPublishedContent>;
export const notebookPublishedContentDocument = (notebookId: NotebookIdentifier) => doc(notebookPublishedContentCollection, notebookId);

// == Query =======================================================================
// -- Notebook --------------------------------------------------------------------
export const notebookQuery = (filter: NotebookFilter) => {
  let buildQuery = notebookCollection as Query<Notebook_Storage>;

  // filter
  if(!isBlank(filter.name)) {
    // TODO: support substring!!
    buildQuery = query(buildQuery, where(nameof<Notebook_Storage>('name'), '==', filter.name!));
  } /* else -- 'name' was not specified in the filter */

  // NOTE: these are waterfall'd by design
  if(!isBlank(filter.viewableBy)) {
    buildQuery = query(buildQuery, where(nameof<Notebook_Storage>('viewers'), 'array-contains', filter.viewableBy!));
  } /* else -- 'createdBy' was not specified in the filter */
  if(!isBlank(filter.editableBy)) {
    buildQuery = query(buildQuery, where(nameof<Notebook_Storage>('editors'), 'array-contains', filter.editableBy!));
  } /* else -- 'createdBy' was not specified in the filter */
  if(!isBlank(filter.createdBy)) {
    buildQuery = query(buildQuery, where(nameof<Notebook_Storage>('createdBy'), '==', filter.createdBy!));
  } /* else -- 'createdBy' was not specified in the filter */

  const hashtags = normalizeHashtags(filter.hashtags);
  if(hashtags.size > 0) {
    buildQuery = query(buildQuery, where(nameof<Notebook_Storage>('hashtags'), 'array-contains-any', Array.from(hashtags).slice(0, MAX_ARRAY_CONTAINS_ANY)/*bounded by contract*/));
  } /* else -- 'hashtags' was not specified in the filter (with valid hashtags) */

  if(filter.published !== undefined) {
    buildQuery = query(buildQuery, where(nameof<Notebook_Storage>('isPublished'), '==', filter.published));
  } /* else -- 'published' was not specified in the filter */

  // if no filter is applied then both deleted and non-deleted entries are included.
  // * If only-deleted then include only deleted = true
  // * If nothing is specified then only include non-deleted (i.e. deleted = false)
  let includeDeleted = ((filter.deleted === true) || (filter.onlyDeleted === true));
  if(filter.onlyDeleted === true) {
    buildQuery = query(buildQuery, where(nameof<Notebook_Storage>('deleted'), '==', true));
  } /* else -- don't limit to only (soft) deleted entries */
  if(!includeDeleted) {
    buildQuery = query(buildQuery, where(nameof<Notebook_Storage>('deleted'), '==', false));
  } /* else -- (soft) deleted entries should be included */

  // sort
  buildQuery = buildSortQuery(buildQuery, filter, nameof<Notebook_Storage>('name')/*default sort field*/);

  return buildQuery;
};

// -- Published Notebook ----------------------------------------------------------
// NOTE: list views (i.e. something that this query would be used for) *must* use
//       the non-content form of Notebook Published to ensure that as little data
//       as possible is returned to the client.
export const notebookPublishedQuery = (filter: NotebookPublishedFilter) => {
  let buildQuery = notebookPublishedCollection as Query<NotebookPublished_Storage>;

  // filter
  if(!isBlank(filter.title)) {
    // TODO: support substring!!
    buildQuery = query(buildQuery, where(nameof<NotebookPublished_Storage>('title'), '==', filter.title!));
  } /* else -- 'title' was not specified in the filter */

  if(!isBlank(filter.createdBy)) {
    buildQuery = query(buildQuery, where(nameof<NotebookPublished_Storage>('createdBy'), '==', filter.createdBy!));
  } /* else -- 'createdBy' was not specified in the filter */

  const hashtags = normalizeHashtags(filter.hashtags);
  if(hashtags.size > 0) {
    buildQuery = query(buildQuery, where(nameof<NotebookPublished_Storage>('hashtags'), 'array-contains-any', Array.from(hashtags).slice(0, MAX_ARRAY_CONTAINS_ANY)/*bounded by contract*/));
  } /* else -- 'hashtags' was not specified in the filter (with valid hashtags) */

  // sort
  buildQuery = buildSortQuery(buildQuery, filter, nameof<NotebookPublished_Storage>('title')/*default sort field*/);

  return buildQuery;
};

// ................................................................................
const normalizeHashtags = (hashtags?: string[]) =>
  new Set((hashtags ?? []/*none*/)
              .map(hashtag => normalizeHashtag(hashtag))
              .filter(hashtag => !isBlank(hashtag)));
